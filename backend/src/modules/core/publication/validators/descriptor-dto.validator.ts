import {
  isArray,
  isEmpty,
  isNumber,
  isString,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as _ from 'lodash';

@ValidatorConstraint()
export class IsDescriptorDto implements ValidatorConstraintInterface {
  public async validate(descriptor: any) {
    const isValidNumber = (value) => isNumber(value, { allowNaN: false, allowInfinity: false });

    if (!isArray(descriptor.sentences) || descriptor.sentences.length === 0) {
      return false;
    }

    for (const sentence of descriptor.sentences) {
      if (!isString(sentence.value) || isEmpty(sentence.value)) {
        return false;
      }
      if (!isArray(sentence.vector) || sentence.vector.length === 0 || !_.every(sentence.vector, isValidNumber)) {
        return false;
      }
    }

    return true;
  }
}
