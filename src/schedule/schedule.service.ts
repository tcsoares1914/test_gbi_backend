import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './../prisma.service';
import { Prisma, Schedule } from '@prisma/client';

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
  async createSchedule(data: Prisma.ScheduleCreateInput): Promise<Schedule> {
    this.logger.log('createSchedule');
    const schedule = await this.prisma.schedule.create({
      data,
    });

    return schedule;
  }

  /**
   * Find all items.
   */
  async findAll(): Promise<Schedule[]> {
    this.logger.log('getAllSchedules');
    const schedules = await this.prisma.schedule.findMany();

    return schedules;
  }

  /**
   * Find one item.
   */
  async findSchedule(
    scheduleWhereUniqueInput: Prisma.ScheduleWhereUniqueInput,
  ): Promise<Schedule | null> {
    this.logger.log('findSchedule');
    const schedule = await this.prisma.schedule.findUnique({
      where: scheduleWhereUniqueInput,
    });

    return schedule;
  }

  /**
   * Update one item.
   */
  async updateSchedule(params: {
    where: Prisma.ScheduleWhereUniqueInput;
    data: Prisma.ScheduleUpdateInput;
  }): Promise<Schedule> {
    this.logger.log('updateSchedule');
    const updatedSchedule = await this.prisma.schedule.update({
      where: params.where,
      data: params.data,
    });

    return updatedSchedule;
  }

  /**
   * Delete one item.
   */
  async deleteSchedule(
    where: Prisma.ScheduleWhereUniqueInput,
  ): Promise<Schedule> {
    this.logger.log('deleteSchedule');
    const deletedSchedule = await this.prisma.schedule.delete({
      where,
    });

    return deletedSchedule;
  }
}
