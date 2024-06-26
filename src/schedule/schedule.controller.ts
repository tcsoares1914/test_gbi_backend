import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  /**
   * Create constructior instances.
   */
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * Create a new item.
   */
  @Post()
  async create(
    @Body()
    scheduleInput: {
      type: string;
      vehicle: string;
      confirmation: boolean;
    },
  ) {
    return await this.scheduleService.createSchedule(scheduleInput);
  }

  /**
   * Find all items.
   */
  @Get()
  async findAll() {
    return await this.scheduleService.findAll();
  }

  /**
   * Find one item.
   */
  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.scheduleService.findSchedule({ id: id });
  }

  /**
   * Update one item.
   */
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body()
    scheduleInput: {
      type: string;
      vehicle: string;
      confirmation: boolean;
    },
  ) {
    return await this.scheduleService.updateSchedule({
      where: { id: id },
      data: scheduleInput,
    });
  }

  /**
   * Delete one item.
   */
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.scheduleService.deleteSchedule({ id: id });
  }
}
