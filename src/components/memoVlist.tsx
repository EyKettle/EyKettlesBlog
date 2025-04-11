import {
  Component,
  createSignal,
  For,
  JSX,
  JSXElement,
  onCleanup,
  onMount,
} from "solid-js";
import { DOMElement } from "solid-js/jsx-runtime";
import { insert } from "solid-js/web";
import { VList, VListHandle } from "virtua/solid";

export type ScrollDelta = {
  vertical: number;
  horizontal: number;
};

type MemoItem = {
  index: number;
  ref: Element | JSXElement;
};

interface MemoVlistProps {
  children: any[];
  memoList: MemoItem[];
  style?: JSX.CSSProperties;
  horizontal: boolean;
  onScroll?: (
    event: Event & {
      currentTarget: HTMLDivElement;
      target: DOMElement;
    }
  ) => void;
  getProps?(): (props: VlistData) => void;
}

const MemoVlist: Component<MemoVlistProps> = (props) => {
  if (!props.scrollDirection || props.scrollDirection.vertical === undefined)
    props.scrollDirection = {
      vertical: true,
    };

  let vlist: VListHandle;
  let spacer: HTMLDivElement;
  let head: HTMLDivElement;
  let tail: HTMLDivElement;

  let items: Element[] = new Array(props.data.length);
  let itemHeights: number[] = new Array(props.data.length);

  let vlistData: VlistData = { startIndex: 0, endIndex: 0 };
  onMount(() => {
    if (props.data.length === 0) return;

    const gap = parseFloat(getComputedStyle(spacer).gap);

    let currentHeight: number | null = 0;
    const scrollBottom =
      spacer.scrollTop + listBox.getBoundingClientRect().height;
    props.data.map((item, index) => {
      const e = props.children(item, index);
      const wrapper = document.createElement("div");
      insert(wrapper, e);
      items[index] = wrapper;
      const resizeObserver = new ResizeObserver(() => {
        itemHeights[index] = wrapper.clientHeight;
      });
      resizeObserver.observe(wrapper);
      onCleanup(() => resizeObserver.unobserve(wrapper));

      // 临时替代一下，之后有位置记忆后会使用和 handScroll 一样的逻辑执行
      if (currentHeight)
        if (currentHeight >= scrollBottom) {
          vlistData.endIndex = index;
          currentHeight = null;
        } else currentHeight += 80 + gap;
    });

    let fullHeight = 0;
    itemHeights.forEach((h) => (fullHeight += h));
    spacer.style.height = fullHeight + "px";
    onView();
  });
  const [viewItems, setViewItems] = createSignal<any[]>([]);

  const handleScroll = (
    event: Event & {
      currentTarget: HTMLDivElement;
      target: DOMElement;
    }
  ) => {
    if (itemHeights.length === 0) return;

    const { height, width } = listBox.getBoundingClientRect();
    const scrollTop = spacer.scrollTop;

    let currentHeight = 0;
    let visibleHeight = 0;
    let needRefresh = false;

    const gap = parseFloat(getComputedStyle(spacer).gap);
    const scrollBottom = scrollTop + height;

    for (let i = 0; i < itemHeights.length; i++) {
      if (currentHeight >= scrollTop) {
        if (i !== vlistData.startIndex) {
          vlistData.startIndex = i;
          needRefresh = true;
        }
        break;
      } else currentHeight += itemHeights[i] + gap;
    }
    if (vlistData.startIndex !== items.length - 1)
      for (let i = vlistData.startIndex; i < itemHeights.length; i++) {
        if (currentHeight + visibleHeight - gap >= scrollBottom) {
          if (i !== vlistData.endIndex) {
            vlistData.endIndex = i;
          }
          break;
        } else visibleHeight += itemHeights[i] + gap;
      }

    if (needRefresh) {
      head.style.height = currentHeight - gap + "px";
      onView();
    }
  };

  const onView = () => {
    setViewItems(items.slice(vlistData.startIndex, vlistData.endIndex));
  };

  return (
    <VList
      ref={(e) => {
        if (e) vlist = e;
      }}
      style={{
        display: "flex",
        "flex-direction": "column",
        height: "100%",
        width: "100%",
        ...props.style,
      }}
      horizontal={props.horizontal}
      data={props.children}
    >
      {(item, index) => {
        let view = props.memoList[index] || item;
        return <>{view}</>;
      }}
    </VList>
  );
};
export default MemoVlist;
