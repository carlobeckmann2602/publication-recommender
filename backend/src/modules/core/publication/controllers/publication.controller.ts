import { Controller, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePublicationDto } from '../dto/create-publication.dto';
import { PublicationVectorsRequestDto } from '../dto/publication-vectors-request.dto';
import { DescriptorService } from '../services/descriptor.service';
import { PublicationService } from '../services/publication.service';

@Controller()
export class PublicationController {
  constructor(
    private publicationService: PublicationService,
    private descriptorService: DescriptorService,
    @Inject('MESSAGE_QUEUE') private client: ClientProxy,
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @MessagePattern('get_publication_vectors')
  @UsePipes(ValidationPipe)
  async provideVectors(@Payload(new ValidationPipe({ transform: true })) dto: PublicationVectorsRequestDto) {
    const chunk = await this.descriptorService.getVectorsChunk(dto);
    this.client.emit('publication_vectors', chunk);
  }

  @MessagePattern('save_publication')
  @UsePipes(ValidationPipe)
  async savePublication(@Payload(new ValidationPipe({ transform: true })) dto: CreatePublicationDto): Promise<void> {
    await this.publicationService.createPublication(dto);
  }
}
