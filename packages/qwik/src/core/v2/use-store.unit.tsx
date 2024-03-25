import { Fragment as Component, Fragment } from '@builder.io/qwik/jsx-runtime';
import { describe, expect, it, vi } from 'vitest';
import { advanceToNextTimerAndFlush, trigger } from '../../testing/element-fixture';
import { component$ } from '../component/component.public';
import { _IMMUTABLE, _fnSignal } from '../internal';
import { inlinedQrl } from '../qrl/qrl';
import { _jsxC } from '../render/jsx/jsx-runtime';
import type { Signal } from '../state/signal';
import { untrack } from '../use/use-core';
import { useLexicalScope } from '../use/use-lexical-scope.public';
import { useSignal } from '../use/use-signal';
import { useStore } from '../use/use-store.public';
import { useTaskQrl } from '../use/use-task';
import { domRender, ssrRenderToDom } from './rendering.unit-util';
import type { fixMeAny } from './shared/types';
import './vdom-diff.unit-util';

const debug = false; //true;
Error.stackTraceLimit = 100;

[
  ssrRenderToDom, //
  domRender, //
].forEach((render) => {
  describe(render.name + ': useStore', () => {
    it('should render value', async () => {
      const Cmp = component$(() => {
        const store = useStore({ items: [{ num: 0 }] });
        return (
          <>
            {store.items.map((item, key) => (
              <div key={key}>{item.num}</div>
            ))}
          </>
        );
      });

      const { vNode } = await render(<Cmp />, { debug });
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <div key="0">0</div>
          </Fragment>
        </Component>
      );
    });
    it('should update value', async () => {
      const Counter = component$(() => {
        const count = useStore({ count: 123 });
        return (
          <button onClick$={inlinedQrl(() => useLexicalScope()[0].count++, 's_onClick', [count])}>
            Count: {count.count}!
          </button>
        );
      });

      const { vNode, container } = await render(<Counter />, { debug });
      expect(vNode).toMatchVDOM(
        <>
          <button>Count: {'123'}!</button>
        </>
      );
      await trigger(container.element, 'button', 'click');
      expect(vNode).toMatchVDOM(
        <>
          <button>Count: {'124'}!</button>
        </>
      );
    });
    it('should update deep value', async () => {
      const Counter = component$(() => {
        const count = useStore({ obj: { count: 123 } });
        return (
          <button
            onClick$={inlinedQrl(() => useLexicalScope()[0].obj.count++, 's_onClick', [count])}
          >
            Count: {count.obj.count}!
          </button>
        );
      });

      const { vNode, container } = await render(<Counter />, { debug });
      expect(vNode).toMatchVDOM(
        <>
          <button>Count: {'123'}!</button>
        </>
      );
      await trigger(container.element, 'button', 'click');
      expect(vNode).toMatchVDOM(
        <>
          <button>Count: {'124'}!</button>
        </>
      );
    });

    it('should rerender child', async () => {
      const log: string[] = [];
      const Display = component$((props: { dValue: number }) => {
        log.push('Display');
        return <span>Count: {props.dValue}!</span>;
      });
      const Counter = component$((props: { initial: number }) => {
        log.push('Counter');
        const count = useStore({ obj: { value: props.initial } });
        return (
          <button
            onClick$={inlinedQrl(
              () => {
                useLexicalScope()[0].obj.value++;
              },
              's_onClick',
              [count]
            )}
          >
            <Display dValue={count.obj.value} />
          </button>
        );
      });

      const { vNode, container } = await render(<Counter initial={123} />, { debug });
      expect(vNode).toMatchVDOM(
        <>
          <button>
            <>
              <span>Count: {'123'}!</span>
            </>
          </button>
        </>
      );
      log.length = 0;
      await trigger(container.element, 'button', 'click');
      expect(log).toEqual(['Counter', 'Display']);
      expect(vNode).toMatchVDOM(
        <>
          <button>
            <>
              <span>Count: {'124'}!</span>
            </>
          </button>
        </>
      );
    });
    describe('derived', () => {
      it('should update value directly in DOM', async () => {
        const log: string[] = [];
        const Counter = component$((props: { initial: number }) => {
          const count = useStore({ value: props.initial });
          log.push('Counter: ' + untrack(() => count.value));
          return (
            <button onClick$={inlinedQrl(() => useLexicalScope()[0].value++, 's_onClick', [count])}>
              Count: {_fnSignal((p0) => p0.value, [count], 'p0.value')}!
            </button>
          );
        });

        const { vNode, container } = await render(<Counter initial={123} />, {
          debug,
          // oldSSR: true,
        });
        expect(log).toEqual(['Counter: 123']);
        log.length = 0;
        expect(vNode).toMatchVDOM(
          <Component>
            <button>
              Count: <>{'123'}</>!
            </button>
          </Component>
        );
        await trigger(container.element, 'button', 'click');
        expect(log).toEqual([]);
        log.length = 0;
        expect(vNode).toMatchVDOM(
          <>
            <button>
              Count: <>{'124'}</>!
            </button>
          </>
        );
      });
      it('should allow signal to deliver value or JSX', async () => {
        const log: string[] = [];
        const Counter = component$(() => {
          const count = useStore<any>({ value: 'initial' });
          log.push('Counter: ' + untrack(() => count.value));
          return (
            <button
              onClick$={inlinedQrl(
                () => {
                  const [s] = useLexicalScope();
                  s.value = typeof s.value == 'string' ? <b>JSX</b> : 'text';
                },
                's_onClick',
                [count]
              )}
            >
              -{_fnSignal((p0) => p0.value, [count], 'p0.value')}-
            </button>
          );
        });

        const { vNode, container } = await render(<Counter />, { debug });
        expect(log).toEqual(['Counter: initial']);
        log.length = 0;
        expect(vNode).toMatchVDOM(
          <Component>
            <button>
              -<>{'initial'}</>-
            </button>
          </Component>
        );
        await trigger(container.element, 'button', 'click');
        expect(log).toEqual([]);
        log.length = 0;
        expect(vNode).toMatchVDOM(
          <>
            <button>
              -
              <>
                <b>JSX</b>
              </>
              -
            </button>
          </>
        );
        await trigger(container.element, 'button', 'click');
        expect(log).toEqual([]);
        log.length = 0;
        expect(vNode).toMatchVDOM(
          <>
            <button>
              -<>{'text'}</>-
            </button>
          </>
        );
      });
      it('should update value when store, update and render are separated', async () => {
        const renderLog: string[] = [];
        const Counter = component$(() => {
          renderLog.push('Counter');
          const count = useStore({ value: 123 });
          return (
            <>
              {/* <Display displayValue={count.value} /> */}
              {_jsxC(
                Display as fixMeAny,
                {
                  get displayValue() {
                    return count.value;
                  },
                  [_IMMUTABLE]: {
                    displayValue: _fnSignal((p0) => p0.value, [count], 'p0.value'),
                  },
                },
                3,
                'H1_0'
              )}
              <Incrementor countSignal={count} />
            </>
          );
        });
        const Incrementor = component$((props: { countSignal: Signal<number> }) => {
          renderLog.push('Incrementor');
          return (
            <button
              onClick$={inlinedQrl(
                () => {
                  const [countSignal] = useLexicalScope();
                  countSignal.value++;
                },
                's_onClick',
                [props.countSignal]
              )}
            >
              +1
            </button>
          );
        });
        const Display = component$((props: { displayValue: number }) => {
          renderLog.push('Display');
          return <>Count: {_fnSignal((p0) => p0.displayValue, [props], 'p0.displayValue')}!</>;
        });
        const { vNode, container } = await render(<Counter />, { debug });
        expect(renderLog).toEqual(['Counter', 'Display', 'Incrementor']);
        renderLog.length = 0;
        await trigger(container.element, 'button', 'click');
        expect(renderLog).toEqual([]);
        expect(vNode).toMatchVDOM(
          <Fragment>
            <>
              <Component>
                <>
                  Count: <>{'124'}</>!
                </>
              </Component>
              <Component>
                <button>+1</button>
              </Component>
            </>
          </Fragment>
        );
      });
    });
  });

  describe(render.name + 'regression', () => {
    it('#5597 - should update value', async () => {
      let clicks = 0;
      const Issue5597 = component$(() => {
        const count = useSignal(0);
        const store = useStore({ items: [{ num: 0 }] });
        return (
          <>
            <button
              onClick$={inlinedQrl(
                () => {
                  const [count, store] = useLexicalScope();
                  count.value++;
                  store.items = store.items.map((i: { num: number }) => ({ num: i.num + 1 }));
                  clicks++;
                },
                's_onClick',
                [count, store]
              )}
            >
              Count: {count.value}!
            </button>
            {store.items.map((item, key) => (
              <div key={key}>{item.num}</div>
            ))}
          </>
        );
      });

      const { vNode, container } = await render(<Issue5597 />, { debug });
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <button>
              {'Count: '}
              {clicks}
              {'!'}
            </button>
            <div key="0">{clicks}</div>
          </Fragment>
        </Component>
      );
      await trigger(container.element, 'button', 'click');
      await trigger(container.element, 'button', 'click');
      await trigger(container.element, 'button', 'click');
      await trigger(container.element, 'button', 'click');
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <button>
              {'Count: '}
              {clicks}
              {'!'}
            </button>
            <div key="0">{clicks}</div>
          </Fragment>
        </Component>
      );
    });

    it('#5597 - should update value with setInterval', async () => {
      vi.useFakeTimers();
      const Cmp = component$(() => {
        const count = useSignal(0);
        const store = useStore({ items: [{ num: 0 }] });
        useTaskQrl(
          inlinedQrl(
            ({ cleanup }) => {
              const [count, store] = useLexicalScope();

              const intervalId = setInterval(() => {
                count.value++;
                store.items = store.items.map((i: { num: number }) => ({ num: i.num + 1 }));
              }, 500);

              cleanup(() => clearInterval(intervalId));
            },
            's_useTask',
            [count, store]
          ),
          {
            eagerness: 'visible',
          }
        );
        return (
          <>
            <div>Count: {count.value}!</div>
            {store.items.map((item, key) => (
              <div key={key}>{item.num}</div>
            ))}
          </>
        );
      });
      const { vNode, document } = await render(<Cmp />, { debug });
      await trigger(document.body, 'div', 'qvisible');
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <div>
              {'Count: '}
              {'0'}
              {'!'}
            </div>
            <div key="0">0</div>
          </Fragment>
        </Component>
      );
      await advanceToNextTimerAndFlush();
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <div>
              {'Count: '}
              {'1'}
              {'!'}
            </div>
            <div key="0">1</div>
          </Fragment>
        </Component>
      );
      await advanceToNextTimerAndFlush();
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <div>
              {'Count: '}
              {'2'}
              {'!'}
            </div>
            <div key="0">2</div>
          </Fragment>
        </Component>
      );
      vi.useRealTimers();
    });

    it('#5662 - should update value in the list', async () => {
      const Cmp = component$(() => {
        const store = useStore<{ users: { name: string }[] }>({ users: [{ name: 'Giorgio' }] });

        return (
          <div>
            {store.users.map((user, key) => (
              <span
                key={key}
                onClick$={inlinedQrl(
                  () => {
                    const [store] = useLexicalScope();
                    store.users = store.users.map(({ name }: { name: string }) => ({
                      name: name === user.name ? name + '!' : name,
                    }));
                  },
                  's_onClick',
                  [store]
                )}
              >
                {user.name}
              </span>
            ))}
          </div>
        );
      });
      const { vNode, container } = await render(<Cmp />, { debug });
      expect(vNode).toMatchVDOM(
        <Component>
          <div>
            <span key="0">{'Giorgio'}</span>
          </div>
        </Component>
      );
      await trigger(container.element, 'span', 'click');
      await trigger(container.element, 'span', 'click');
      await trigger(container.element, 'span', 'click');
      await trigger(container.element, 'span', 'click');
      await trigger(container.element, 'span', 'click');
      expect(vNode).toMatchVDOM(
        <Component>
          <div>
            <span key="0">{'Giorgio!!!!!'}</span>
          </div>
        </Component>
      );
    });

    it('#5017 - should update child nodes for direct array', async () => {
      const Child = component$<{ columns: string }>(({ columns }) => {
        return <div>Child: {columns}</div>;
      });

      const Parent = component$(() => {
        const state = useStore([{ columns: 'INITIAL' }]);
        return (
          <>
            <button
              onClick$={inlinedQrl(
                () => {
                  const [state] = useLexicalScope();
                  state[0] = { columns: 'UPDATE' };
                },
                's_onClick',
                [state]
              )}
            >
              update!
            </button>
            <Child columns={state[0].columns} />
            {state.map((block, idx) => {
              return <Child columns={block.columns} key={idx} />;
            })}
          </>
        );
      });

      const { vNode, container } = await render(<Parent />, { debug });

      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <button>update!</button>
            <Component>
              <div>
                {'Child: '}
                {'INITIAL'}
              </div>
            </Component>
            <Component>
              <div>
                {'Child: '}
                {'INITIAL'}
              </div>
            </Component>
          </Fragment>
        </Component>
      );
      await trigger(container.element, 'button', 'click');
      expect(vNode).toMatchVDOM(
        <Component>
          <Fragment>
            <button>update!</button>
            <Component>
              <div>
                {'Child: '}
                {'UPDATE'}
              </div>
            </Component>
            <Component>
              <div>
                {'Child: '}
                {'UPDATE'}
              </div>
            </Component>
          </Fragment>
        </Component>
      );
    });
  });
});