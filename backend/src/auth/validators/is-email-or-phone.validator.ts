import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isEmail } from 'class-validator';

@ValidatorConstraint({ name: 'isEmailOrPhone', async: false })
export class IsEmailOrPhone implements ValidatorConstraintInterface {
  validate(value: string) {
    const phoneRegex = /^[0-9]{10,15}$/;
    return isEmail(value) || phoneRegex.test(value);
  }

  defaultMessage() {
    return 'Identifier must be a valid email or phone number';
  }
}