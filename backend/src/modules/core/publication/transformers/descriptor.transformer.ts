import { plainToInstance } from 'class-transformer';
import { ValueTransformer } from 'typeorm';
import { DescriptorDto } from '../dto/descriptor.dto';

export class DescriptorTransformer implements ValueTransformer {
  from(value: any): DescriptorDto {
    if (value) {
      return plainToInstance<DescriptorDto, any>(DescriptorDto, value);
    }
  }

  to(data: DescriptorDto): any {
    return data;
  }
}
