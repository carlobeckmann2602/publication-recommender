import { RuntimeException } from '@nestjs/core/errors/exceptions';

export class SourceVo {
  private static VALUE_ARXIV = 'arxiv';

  private static VALUES = [SourceVo.VALUE_ARXIV];

  constructor(private readonly value: string) {}

  public getValue(): string {
    return this.value;
  }

  public static getAvailableValues(): string[] {
    return SourceVo.VALUES;
  }

  public equals(object: SourceVo): boolean {
    return this.getValue() === object.getValue();
  }

  public static fromString(value: string): SourceVo {
    if (!SourceVo.VALUES.includes(value)) {
      throw new RuntimeException(`Invalid ${SourceVo} value ${value}`);
    }

    return new SourceVo(value);
  }

  public static arxiv(): SourceVo {
    return new SourceVo(this.VALUE_ARXIV);
  }
}
