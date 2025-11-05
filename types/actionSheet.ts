export interface ActionSheetConfig {
  title?: string;
  options: string[];
  cancelButtonIndex: number;
  destructiveButtonIndex?: number;
  onPress: (index: number) => void;
}

export interface ActionSheetRef {
  show: (config: ActionSheetConfig) => void;
}
