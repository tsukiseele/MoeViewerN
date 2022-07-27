import { defineComponent } from 'vue';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}
const Input = defineComponent({
  setup(props: any) {
    const handleChange = (event: Event) => {
      //@ts-ignore
      props.onChange(event?.target.value);
    }

    return () => (
      <input value={props.value} onInput={handleChange} />
    )
  }
})