import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { PublicationCreateDto } from '../dto/publication-create.dto';
import { MessageQueService } from '../services/messageQue.service';

@Controller()
export class MessageQueControler {
  constructor(
    private messageQueService: MessageQueService,
    @Inject('MESSAGEQUE_SERVICE') private client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @MessagePattern('annoy_data_get')
  async provideAnnoiyData(@Payload() payload: { index: number }, @Ctx() ctx: RmqContext) {
    const data = await this.messageQueService.getAnnoyData(payload.index);
    this.client.emit('annoy_data_send', data);
  }

  @MessagePattern('save_publication')
  async savePublication(@Payload() payload: PublicationCreateDto, @Ctx() ctx: RmqContext) {
    console.log(payload);
    await this.messageQueService.savePublication(payload);
  }
}
