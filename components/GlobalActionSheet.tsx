import { ActionSheetConfig, ActionSheetRef } from "@/types/actionSheet";
import ActionSheetHelper from "@/utils/ActionSheetHelper";
import React from "react";
import ActionSheet from "react-native-actionsheet";

interface GlobalActionSheetState {
  show: boolean;
  title: string;
  options: string[];
  cancelButtonIndex: number;
  destructiveButtonIndex?: number;
  onPress: (index: number) => void;
}

export default class GlobalActionSheet
  extends React.Component<{}, GlobalActionSheetState>
  implements ActionSheetRef
{
  private actionSheetRef: React.RefObject<ActionSheet>;

  constructor(props: {}) {
    super(props);
    this.state = {
      show: false,
      title: "",
      options: [],
      cancelButtonIndex: 0,
      onPress: () => {},
    };
    this.actionSheetRef = React.createRef<ActionSheet>();
  }

  componentDidMount(): void {
    ActionSheetHelper.setActionSheetRef(this);
  }

  componentWillUnmount(): void {
    ActionSheetHelper.setActionSheetRef(null);
  }

  show = (config: ActionSheetConfig): void => {
    this.setState(
      {
        title: config.title || "",
        options: config.options,
        cancelButtonIndex: config.cancelButtonIndex,
        destructiveButtonIndex: config.destructiveButtonIndex,
        onPress: config.onPress,
      },
      () => {
        if (this.actionSheetRef.current) {
          this.actionSheetRef.current.show();
        }
      }
    );
  };

  handlePress = (index: number): void => {
    this.state.onPress(index);
  };

  render(): React.ReactNode {
    return (
      <ActionSheet
        ref={this.actionSheetRef}
        title={this.state.title}
        options={this.state.options}
        cancelButtonIndex={this.state.cancelButtonIndex}
        destructiveButtonIndex={this.state.destructiveButtonIndex}
        onPress={this.handlePress}
      />
    );
  }
}
