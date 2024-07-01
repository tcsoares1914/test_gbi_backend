import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from './../prisma.service';
import { Prisma, Schedules } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class ScheduleService {
  /**
   * Create constructior instances.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Define service to be logged.
   */
  private logger = new Logger('Schedule service');

  /**
   * Create a new item.
   */
  async createSchedule(data: Prisma.SchedulesCreateInput) {
    this.logger.log('createSchedule');
    try {
      const washingQuantitySlots = this.checkSlotsByWashingType(data.type);
      const dateSlot = new Date(data.slot);
      const checkPlate = await this.checkVehiclePlate(data.vehicle);

      if (checkPlate === false) {
        throw new BadRequestException('A placa não está no padrão Mercosul!');
      }

      const checkDay = await this.checkAvailableDays(dateSlot);

      if (checkDay === false) {
        throw new BadRequestException(
          'Não é possivel aguendar aos finais de semana!',
        );
      }

      const checkAvailableHours = await this.checkAvailableHours(dateSlot);

      if (checkAvailableHours === false) {
        throw new BadRequestException(
          'Não é possivel agendar fora do horário de atendimento (10 as 12 - 13 as 18)!',
        );
      }

      const canSchedule = await this.checkSlotAvailability(
        dateSlot,
        washingQuantitySlots,
      );

      if (canSchedule === false) {
        throw new BadRequestException(
          'Ja existe uma lavagem agendada ou em andamento neste horário!',
        );
      }

      data.slot = new Date(dateSlot).toISOString();
      const schedule = await this.prisma.schedules.create({
        data,
      });

      return schedule;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.response.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }

  /**
   * Find all items.
   */
  async findAll(): Promise<Schedules[]> {
    this.logger.log('getAllSchedules');
    const schedules = await this.prisma.schedules.findMany();

    return schedules;
  }

  /**
   * Find one item.
   */
  async findSchedule(
    scheduleWhereUniqueInput: Prisma.SchedulesWhereUniqueInput,
  ): Promise<Schedules | null> {
    this.logger.log('findSchedule');
    const schedule = await this.prisma.schedules.findUnique({
      where: scheduleWhereUniqueInput,
    });

    return schedule;
  }

  /**
   * Update one item.
   */
  async updateSchedule(params: {
    where: Prisma.SchedulesWhereUniqueInput;
    data: Prisma.SchedulesUpdateInput;
  }): Promise<Schedules> {
    this.logger.log('updateSchedule');
    const updatedSchedule = await this.prisma.schedules.update({
      where: params.where,
      data: params.data,
    });

    return updatedSchedule;
  }

  /**
   * Delete one item.
   */
  async deleteSchedule(
    where: Prisma.SchedulesWhereUniqueInput,
  ): Promise<Schedules> {
    this.logger.log('deleteSchedule');
    const deletedSchedule = await this.prisma.schedules.delete({
      where,
    });

    return deletedSchedule;
  }

  /**
   * Check quantity of slots by whashing type.
   */
  protected checkSlotsByWashingType(type: string): number | null {
    if (type === 'SIMPLE') {
      return 2;
    }

    if (type === 'COMPLETE') {
      return 3;
    }

    return null;
  }

  /**
   * Check vehicle plate.
   */
  protected async checkVehiclePlate(plate: string) {
    const regex = /^[a-zA-Z]{3}[a-zA-Z0-9]{4}$/;

    return regex.test(plate);
  }

  /**
   * Check selected day if not into a weekend.
   */
  protected async checkAvailableDays(slot: Date): Promise<boolean> {
    if (slot.getDay() == 6 || slot.getDay() == 0) {
      return false;
    }

    return true;
  }

  /**
   * Check selected day if not into a weekend.
   */
  protected async checkAvailableHours(slot: Date): Promise<boolean> {
    const hour = slot.getHours();
    if (hour < 10 || hour > 18 || (hour > 12 && hour < 13)) {
      return false;
    }

    return true;
  }

  /**
   * Check if date slot is available for schedule.
   */
  protected async checkSlotAvailability(
    slot: Date,
    slotQuantity: number,
  ): Promise<boolean> {
    let slotDateFinish;

    const slotDateStart = moment(slot).format('YYYY-MM-DD HH:mm:ss');

    if (slotQuantity === 2) {
      slotDateFinish = moment(slotDateStart)
        .add(30, 'minute')
        .format('YYYY-MM-DD HH:mm:ss');
    }

    if (slotQuantity === 3) {
      slotDateFinish = moment(slotDateStart)
        .add(45, 'minute')
        .format('YYYY-MM-DD HH:mm:ss');
    }

    const checkAvailability = await this.findSchedulesBetweenDates(
      slotDateStart,
      slotDateFinish,
    );

    if (checkAvailability.length > 0) {
      return false;
    }

    return true;
  }

  /**
   * Search schedules between dates.
   */
  protected async findSchedulesBetweenDates(
    startDate: string,
    finalDate: string,
  ) {
    return await this.prisma.schedules.findMany({
      where: {
        slot: {
          lte: new Date(finalDate).toISOString(),
          gte: new Date(startDate).toISOString(),
        },
      },
    });
  }

  /**
   *
   */
  protected getAvailableScheduleSlotsByTypeQuantity(
    dateSlot: Date,
    quantitySlots: number,
  ) {
    let blockedSlots = [];
    if (quantitySlots === 2) {
      blockedSlots = [
        {
          date: moment(dateSlot).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          date: moment(dateSlot)
            .add(15, 'minute')
            .format('YYYY-MM-DD HH:mm:ss'),
        },
      ];
    }

    if (quantitySlots === 3) {
      blockedSlots = [
        {
          date: moment(dateSlot).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          date: moment(dateSlot)
            .add(15, 'minute')
            .format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          date: moment(dateSlot)
            .add(30, 'minute')
            .format('YYYY-MM-DD HH:mm:ss'),
        },
      ];
    }

    return blockedSlots;
  }
}
