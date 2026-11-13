"use client";

import { Checkbox, SelectInput, TextArea, TextInput } from "@/components/forms/Fields";
import { useFieldError } from "./forms";

/** Field wrappers that pick up Server Action validation errors from <ActionForm>. */
export function AText(props: React.ComponentProps<typeof TextInput> & { name: string }) {
  const error = useFieldError(props.name);
  return <TextInput {...props} error={props.error ?? error} />;
}

export function AArea(props: React.ComponentProps<typeof TextArea> & { name: string }) {
  const error = useFieldError(props.name);
  return <TextArea {...props} error={props.error ?? error} />;
}

export function ASelect(props: React.ComponentProps<typeof SelectInput> & { name: string }) {
  const error = useFieldError(props.name);
  return <SelectInput {...props} error={props.error ?? error} />;
}

export function ACheck(props: React.ComponentProps<typeof Checkbox> & { name: string }) {
  const error = useFieldError(props.name);
  return <Checkbox {...props} error={props.error ?? error} />;
}
