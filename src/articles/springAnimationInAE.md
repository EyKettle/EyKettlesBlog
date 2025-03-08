# AE 中的弹簧动画

## 前言

**nnd，连着两天干研究这个结果发现……AE 表达式，表-达-式-啊，所以没法存储变量，刚开始我还奇怪呢，所以是真没法用。**

**不过好的一点是，除了不能设定两个相同数值的关键帧，不然有 bug 以外，这个玩意做多帧连续的弹簧动画效果还是挺好的。**

**虽然但是，我不想优化了，有人看到有功夫可以去尝试优化罢……**

**或者回头我自己尝试优化……**

- [ ] 尝试重构

**还有问题，连续动画因为不能实时调整弹性，所以时间间隔不同的话效果还是有点怪。（所以是因为参数应该是 质量 和 阻尼 而非 综合选项弹性 罢）**

---

- **_以下代码借助 Deepseek-R1 和 Gemini-2.0-FTE 完成_**
- **_原始版本参考自 B 站 UP[daodaoup](https://space.bilibili.com/46031672)_**

注意，弹性强度和动画时间过小的情况下初始位置会有问题。

```javascript
/*
[可调参数说明]
springBounceIntensity - 弹性强度 (0-1)
momentumPreservation - 动量保留系数 (0-1), 0=无动量继承, 1=完全保留
maxVelocity - 最大允许速度，防止数值过大导致异常
projectFPS - *[重要参数]* 匹配项目帧率，用以计算 minSegmentDuration 以防时间在一帧内时进行复杂计算
*/
(function () {
  //================= 用户参数 =================
  const springBounceIntensity = 0.3;
  const momentumPreservation = 0.8;
  const maxVelocity = 5000;
  const projectFPS = 60;

  //============= 系统初始化 ==============
  const minSegmentDuration = 1 / projectFPS;
  const availableKeyframes = numKeys || 0;
  if (availableKeyframes < 2) return value;

  //============= 状态管理 ==============
  let currentSegment = null;
  let velocityHistory = 0;
  let currentStartTime = key(1).time;

  //============= 关键帧段检测 ==============
  for (let i = 1; i < availableKeyframes; i++) {
    let segStart = key(i).time;
    const segEnd = key(i + 1).time;

    if (valueAtTime(segStart) === valueAtTime(segEnd)) {
      segStart = currentStartTime;
    } else {
      currentStartTime = segStart;
    }

    const isLastSegment = i === availableKeyframes - 1;
    const inTimeRange = time >= segStart && (isLastSegment || time < segEnd);

    if (inTimeRange) {
      const segDuration = segEnd - segStart;

      if (segDuration < minSegmentDuration) {
        currentSegment = {
          type: "linear",
          start: segStart,
          end: segEnd,
          startVal: valueAtTime(segStart),
          endVal: valueAtTime(segEnd),
        };
        break;
      }

      const initialVelocity = i === 1 ? 0 : velocityHistory;

      currentSegment = {
        type: "spring",
        index: i,
        start: segStart,
        end: segEnd,
        duration: segDuration,
        startVal: valueAtTime(segStart),
        endVal: valueAtTime(segEnd),
        initialVelocity: initialVelocity * momentumPreservation,
      };
      break;
    }
  }

  if (!currentSegment) return valueAtTime(key(1).time);

  //============= 动画计算 ==============
  let result;
  if (currentSegment.type === "linear") {
    result = linear(
      currentSegment.start,
      currentSegment.end,
      currentSegment.startVal,
      currentSegment.endVal,
      time
    );
  } else {
    const elapsed = Math.max(0, time - currentSegment.start);
    const progress = calculateSpring(
      elapsed,
      currentSegment.duration,
      currentSegment.initialVelocity
    );

    result =
      currentSegment.startVal +
      (currentSegment.endVal - currentSegment.startVal) * progress;

    velocityHistory = calculateCurrentVelocity(
      elapsed,
      currentSegment.duration,
      currentSegment.initialVelocity
    );
  }

  return result;

  //============= 物理模型核心 ==============
  function calculateSpring(elapsedTime, duration, initialVel) {
    const omega = (2 * Math.PI) / duration;
    const zeta = 1 - springBounceIntensity;

    const alpha = omega * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega * elapsedTime);

    const phase =
      alpha * elapsedTime + Math.atan2(zeta * omega + initialVel, alpha);
    return 1 - decay * Math.cos(phase);
  }

  function calculateCurrentVelocity(elapsedTime, duration, initialVel) {
    const h = 0.001;
    const p1 = calculateSpring(elapsedTime, duration, initialVel);
    const p2 = calculateSpring(elapsedTime + h, duration, initialVel);
    return clamp(((p2 - p1) / h) * duration, -maxVelocity, maxVelocity);
  }

  //============= 工具函数 ==============
  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function linear(t1, t2, v1, v2, t) {
    return v1 + (v2 - v1) * ((t - t1) / (t2 - t1));
  }
})();
```
