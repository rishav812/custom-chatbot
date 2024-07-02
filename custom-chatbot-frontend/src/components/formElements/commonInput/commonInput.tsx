import { ChangeEvent, FC, InputHTMLAttributes, Ref } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  useForm,
} from "react-hook-form";

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
  iconSrc?: string;
  align?: string;
  parentClassName?: string;
  control?: Control<any>;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<FieldValues>>;
  ref?: Ref<HTMLInputElement>;
}

const CommonInput: FC<IProps> = ({
  control,
  name,
  value,
  onChange,
  error,
  ref,
  ...props
}) => {
  const { clearErrors } = useForm();
  return (
    <>
      <Controller
        render={({ field }) => (
          <input
            {...field}
            {...props}
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e);
              }
            }}
            autoComplete="off"
            ref={ref}
            onBlur={() => {
              if (error && error.message) {
                clearErrors(`${field.name}`);
              }
            }}
          />
        )}
        name={name as string}
        defaultValue={value || ""}
        control={control ? control : undefined}
      />
      {error && <p className="auth-msg danger">{error?.message as string}</p>}
    </>
  );
};

export default CommonInput;
