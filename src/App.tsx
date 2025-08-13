import { createEffect, createSignal, For } from "solid-js";
import Button from "./components/button";
import Box from "./components/box";
import { TransitionGroup } from "solid-transition-group";
import { animate, createSpring, waapi } from "animejs";

const App = () => {
  const [list, setList] = createSignal<string[]>([]);

  createEffect(() => {
    console.log("列表被更改：", list());
  });

  return (
    <div
      class="page base-page"
      style={{
        display: "grid",
        "grid-template-rows": "auto 1fr",
        overflow: "hidden",
        "padding-top": "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          "justify-content": "center",
        }}
      >
        <Button
          label="增加"
          onClick={() => {
            setList((old) => {
              let value = [...old];
              value.push("条目" + (value.length + 1));
              return value;
            });
          }}
        />
        <Button
          label="减少"
          onClick={() => {
            setList((old) => {
              let value = [...old];
              value.splice(
                Math.round(Math.random() * (old.length / 2)) + old.length / 4,
                1
              );
              return value;
            });
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "0.5rem",
          height: "100%",
          width: "100vw",
          overflow: "scroll",
          "place-items": "center",
          "padding-bottom": "1rem",
        }}
      >
        <TransitionGroup
          onEnter={(el, done) => {
            if (!(el instanceof HTMLElement)) {
              done();
              return;
            }
            animate(el, {
              x: ["16rem", "0"],
              opacity: [0, 1],
              ease: createSpring({
                stiffness: 400,
                damping: 20,
              }),
            }).then(done);
          }}
          onExit={(el, done) => {
            if (!(el instanceof HTMLElement)) {
              done();
              return;
            }
            let height = el.getBoundingClientRect().height + 8;
            animate(el, {
              translate: "-16rem 0",
              opacity: 0,
              "margin-block": `-${height / 2}px`,
              ease: "out(4)",
              duration: 300,
            }).then(done);
          }}
        >
          <For each={list()}>
            {(label, index) => {
              return (
                <Box
                  style={{
                    "max-width": "8rem",
                  }}
                >
                  {label}
                </Box>
              );
            }}
          </For>
        </TransitionGroup>
      </div>
    </div>
  );
};

export default App;
