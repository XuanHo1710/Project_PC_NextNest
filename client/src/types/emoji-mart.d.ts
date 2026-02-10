declare module "@emoji-mart/react" {
  import { ComponentType } from "react";

  interface EmojiMartProps {
    onEmojiSelect?: (emoji: {
      native: string;
      id: string;
      shortcodes: string;
    }) => void;
    theme?: "light" | "dark" | "auto";
    locale?: string;
    previewPosition?: "top" | "bottom" | "none";
    skinTonePosition?: "preview" | "search" | "none";
    set?: "native" | "apple" | "facebook" | "google" | "twitter";
    perLine?: number;
    maxFrequentRows?: number;
    searchPosition?: "sticky" | "static" | "none";
    navPosition?: "top" | "bottom" | "none";
    dynamicWidth?: boolean;
    [key: string]: any;
  }

  const Picker: ComponentType<EmojiMartProps>;
  export default Picker;
}

declare module "@emoji-mart/data" {
  const data: any;
  export default data;
}
