declare module 'react-window' {
    import { Component, CSSProperties, ReactElement, Ref } from 'react';
  
    export interface ListOnScrollProps {
      scrollDirection: 'forward' | 'backward';
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }
  
    export interface ListChildComponentProps {
      index: number;
      style: CSSProperties;
    }
  
    export interface VariableSizeListProps {
      children: (props: ListChildComponentProps) => ReactElement;
      height: number;
      itemCount: number;
      itemSize: (index: number) => number;
      width: string | number;
      onScroll?: (props: ListOnScrollProps) => void;
      overscanCount?: number;
    }
  
    export interface VariableSizeList extends Component<VariableSizeListProps> {
      scrollToItem(index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start'): void;
      resetAfterIndex(index: number, shouldForceUpdate?: boolean): void;
    }
  
    export const VariableSizeList: React.ComponentType<VariableSizeListProps & { ref?: Ref<VariableSizeList> }>;
  }
  