import type { ReactNode } from "react";

const INK = "#1c1917";
const MUTE = "#78716c";
const LINE = "#57534e";
const FAINT = "#d6d3d1";
const FILL = "#f5f5f4";
const ACCENT = "#0f766e";
const GOOD = "#047857";
const BAD = "#b91c1c";
const WARN = "#b45309";

function Svg({
  viewBox,
  children,
}: {
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full max-w-xl"
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

function Label({
  x,
  y,
  children,
  anchor = "middle",
  size = 12,
  fill = INK,
  weight = 600,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  fill?: string;
  weight?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {children}
    </text>
  );
}

function Box({
  x,
  y,
  w,
  h,
  label,
  fill = FILL,
  stroke = LINE,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  fill?: string;
  stroke?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} stroke={stroke} strokeWidth={1.25} />
      {label ? <Label x={x + w / 2} y={y + h / 2 + 4}>{label}</Label> : null}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = LINE }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const id = `${x1}-${y1}-${x2}-${y2}`;
  return (
    <g>
      <defs>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#arrow-${id})`}
      />
    </g>
  );
}

const diagrams: Record<string, { alt: string; node: ReactNode }> = {
  "matmul-shapes": {
    alt: "Matrix multiply: X of shape B, T, d times W of shape d, h gives Y of shape B, T, h.",
    node: (
      <Svg viewBox="0 0 420 140">
        <Box x={16} y={40} w={100} h={56} label="X  (B, T, d)" />
        <Label x={140} y={74} size={18}>
          @
        </Label>
        <Box x={160} y={40} w={100} h={56} label="W  (d, h)" />
        <Label x={284} y={74} size={18}>
          =
        </Label>
        <Box x={304} y={40} w={100} h={56} label="Y  (B, T, h)" fill="#ecfdf5" stroke={GOOD} />
        <Label x={210} y={122} size={11} fill={MUTE} weight={500}>
          Cost is about 2 x B x T x d x h FLOPs
        </Label>
      </Svg>
    ),
  },
  "broadcast-bias": {
    alt: "A tensor of shape B, T, d plus a vector of shape d, aligned from the right.",
    node: (
      <Svg viewBox="0 0 420 150">
        <Box x={20} y={24} w={150} h={50} label="a  (B, T, d)" />
        <Label x={195} y={54} size={18}>
          +
        </Label>
        <Box x={220} y={24} w={150} h={50} label="b  (d,)" />
        <Label x={210} y={100} size={12} fill={MUTE} weight={500}>
          Align from the right: (d,) acts like (1, 1, d)
        </Label>
        <Box x={110} y={112} w={200} h={28} label="same bias on every token" fill="#ecfdf5" stroke={GOOD} />
      </Svg>
    ),
  },
  "softmax-temperature": {
    alt: "Softmax with low temperature is sharp, high temperature is flatter.",
    node: (
      <Svg viewBox="0 0 420 200">
        <line x1="40" y1="170" x2="400" y2="170" stroke={LINE} strokeWidth={1.25} />
        <line x1="40" y1="20" x2="40" y2="170" stroke={LINE} strokeWidth={1.25} />
        <Label x={20} y={28} size={11} fill={MUTE} weight={500} anchor="start">
          p
        </Label>
        <Label x={400} y={188} size={11} fill={MUTE} weight={500} anchor="end">
          logit
        </Label>
        <path d="M40,160 C90,158 150,150 210,40 C270,8 330,20 400,28" fill="none" stroke={BAD} strokeWidth={2} />
        <path d="M40,150 C120,148 170,130 210,70 C250,28 310,40 400,55" fill="none" stroke={ACCENT} strokeWidth={2} />
        <path d="M40,130 C130,128 170,120 210,100 C250,80 310,88 400,96" fill="none" stroke={WARN} strokeWidth={2} />
        <Label x={54} y={54} size={11} fill={BAD} anchor="start">
          T = 0.5, sharp
        </Label>
        <Label x={54} y={72} size={11} fill={ACCENT} anchor="start">
          T = 1
        </Label>
        <Label x={54} y={90} size={11} fill={WARN} anchor="start">
          T = 2, flatter
        </Label>
      </Svg>
    ),
  },
  "causal-mask": {
    alt: "A causal attention mask is lower triangular. Future tokens are blocked.",
    node: (
      <Svg viewBox="0 0 280 240">
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 5 }).map((_, c) => {
            const allowed = c <= r;
            return (
              <rect
                key={`${r}-${c}`}
                x={50 + c * 36}
                y={28 + r * 36}
                width={32}
                height={32}
                rx={4}
                fill={allowed ? "#ecfdf5" : "#fef2f2"}
                stroke={allowed ? GOOD : BAD}
                strokeWidth={1}
              />
            );
          }),
        )}
        <Label x={140} y={20} size={12}>
          Query row, key column
        </Label>
        <Label x={140} y={224} size={11} fill={MUTE} weight={500}>
          Green is allowed. Red is the future, set to -inf.
        </Label>
      </Svg>
    ),
  },
  "prenorm-vs-postnorm": {
    alt: "PreNorm puts the norm before attention or MLP. PostNorm puts it after the residual add.",
    node: (
      <Svg viewBox="0 0 420 200">
        <Label x={110} y={22}>PreNorm</Label>
        <Box x={40} y={36} w={140} h={28} label="Norm" />
        <Arrow x1={110} y1={64} x2={110} y2={80} />
        <Box x={40} y={80} w={140} h={28} label="Attn or MLP" />
        <Arrow x1={110} y1={108} x2={110} y2={124} />
        <Box x={40} y={124} w={140} h={28} label="Add residual" fill="#ecfdf5" stroke={GOOD} />
        <Label x={310} y={22}>PostNorm</Label>
        <Box x={240} y={36} w={140} h={28} label="Attn or MLP" />
        <Arrow x1={310} y1={64} x2={310} y2={80} />
        <Box x={240} y={80} w={140} h={28} label="Add residual" />
        <Arrow x1={310} y1={108} x2={310} y2={124} />
        <Box x={240} y={124} w={140} h={28} label="Norm" fill="#fff7ed" stroke={WARN} />
        <Label x={210} y={178} size={11} fill={MUTE} weight={500}>
          PreNorm is the usual choice in modern LLMs
        </Label>
      </Svg>
    ),
  },
  "residual-stream": {
    alt: "A residual block outputs x plus F of x, so the original signal can pass through.",
    node: (
      <Svg viewBox="0 0 420 140">
        <Box x={16} y={50} w={60} h={36} label="x" />
        <Arrow x1={76} y1={68} x2={120} y2={68} />
        <Box x={120} y={20} w={120} h={36} label="F(x)" />
        <Arrow x1={240} y1={38} x2={290} y2={60} />
        <path d="M76,78 C100,110 200,110 290,78" fill="none" stroke={ACCENT} strokeWidth={1.75} />
        <Label x={186} y={124} size={11} fill={ACCENT}>
          skip
        </Label>
        <Box x={300} y={50} w={100} h={36} label="x + F(x)" fill="#ecfdf5" stroke={GOOD} />
      </Svg>
    ),
  },
  "warmup-cosine": {
    alt: "Learning rate rises linearly during warmup, then follows a cosine decay to a floor.",
    node: (
      <Svg viewBox="0 0 420 190">
        <line x1="40" y1="160" x2="400" y2="160" stroke={LINE} strokeWidth={1.25} />
        <line x1="40" y1="20" x2="40" y2="160" stroke={LINE} strokeWidth={1.25} />
        <Label x={20} y={28} size={11} fill={MUTE} weight={500} anchor="start">
          LR
        </Label>
        <Label x={400} y={178} size={11} fill={MUTE} weight={500} anchor="end">
          step
        </Label>
        <path d="M40,150 L110,36 C180,20 250,50 400,120" fill="none" stroke={ACCENT} strokeWidth={2.25} />
        <line x1="110" y1="36" x2="110" y2="160" stroke={FAINT} strokeDasharray="4 3" />
        <Label x={110} y={176} size={11} fill={MUTE} weight={500}>
          warmup ends
        </Label>
        <Label x={250} y={70} size={11} fill={ACCENT}>
          cosine decay
        </Label>
      </Svg>
    ),
  },
  "kv-cache": {
    alt: "Prefill processes the whole prompt once. Decode then adds one token at a time using cached keys and values.",
    node: (
      <Svg viewBox="0 0 420 160">
        <Box x={16} y={30} w={180} h={70} label="" />
        <Label x={106} y={58}>Prefill</Label>
        <Label x={106} y={78} size={11} fill={MUTE} weight={500}>
          all prompt tokens
        </Label>
        <Arrow x1={196} y1={65} x2={230} y2={65} />
        <Box x={230} y={30} w={174} h={70} label="" fill="#ecfdf5" stroke={GOOD} />
        <Label x={317} y={58}>Decode</Label>
        <Label x={317} y={78} size={11} fill={MUTE} weight={500}>
          one new token, reuse cache
        </Label>
        <Label x={210} y={130} size={11} fill={MUTE} weight={500}>
          Positions must be offset by the cache length
        </Label>
      </Svg>
    ),
  },
  "rope-rotation": {
    alt: "RoPE rotates pairs of features by an angle that grows with position.",
    node: (
      <Svg viewBox="0 0 280 220">
        <line x1="40" y1="110" x2="250" y2="110" stroke={FAINT} />
        <line x1="140" y1="20" x2="140" y2="200" stroke={FAINT} />
        <circle cx="140" cy="110" r="70" fill="none" stroke={LINE} strokeWidth={1.25} />
        <line x1="140" y1="110" x2="200" y2="70" stroke={ACCENT} strokeWidth={2} />
        <line x1="140" y1="110" x2="214" y2="124" stroke={WARN} strokeWidth={2} />
        <Label x={210} y={62} size={11} fill={ACCENT} anchor="start">
          pos t
        </Label>
        <Label x={220} y={140} size={11} fill={WARN} anchor="start">
          pos t+k
        </Label>
        <Label x={140} y={214} size={11} fill={MUTE} weight={500}>
          Angle is pos times theta_i for each pair
        </Label>
      </Svg>
    ),
  },
  "scaling-chinchilla": {
    alt: "Chinchilla says compute-optimal models are smaller and train on more tokens than the Kaplan trend.",
    node: (
      <Svg viewBox="0 0 420 200">
        <line x1="50" y1="170" x2="390" y2="170" stroke={LINE} strokeWidth={1.25} />
        <line x1="50" y1="24" x2="50" y2="170" stroke={LINE} strokeWidth={1.25} />
        <Label x={30} y={32} size={11} fill={MUTE} weight={500} anchor="start">
          params
        </Label>
        <Label x={390} y={188} size={11} fill={MUTE} weight={500} anchor="end">
          tokens
        </Label>
        <path d="M60,150 C140,90 220,50 380,28" fill="none" stroke={WARN} strokeWidth={2} />
        <path d="M60,140 C160,120 250,110 380,100" fill="none" stroke={ACCENT} strokeWidth={2} />
        <Label x={250} y={40} size={11} fill={WARN}>
          Kaplan: bigger model
        </Label>
        <Label x={250} y={92} size={11} fill={ACCENT}>
          Chinchilla: more tokens
        </Label>
      </Svg>
    ),
  },
  "moe-router": {
    alt: "A router sends each token to a small set of experts. Most experts stay idle for that token.",
    node: (
      <Svg viewBox="0 0 420 180">
        <Box x={16} y={70} w={80} h={40} label="token" />
        <Arrow x1={96} y1={90} x2={140} y2={90} />
        <Box x={140} y={70} w={80} h={40} label="router" fill="#ecfdf5" stroke={GOOD} />
        <Arrow x1={220} y1={80} x2={270} y2={36} />
        <Arrow x1={220} y1={90} x2={270} y2={90} />
        <Arrow x1={220} y1={100} x2={270} y2={144} color={FAINT} />
        <Box x={270} y={16} w={130} h={36} label="expert 1, active" fill="#ecfdf5" stroke={GOOD} />
        <Box x={270} y={72} w={130} h={36} label="expert 2, active" fill="#ecfdf5" stroke={GOOD} />
        <Box x={270} y={128} w={130} h={36} label="expert 3, idle" fill={FILL} stroke={FAINT} />
      </Svg>
    ),
  },
  "ppo-clip": {
    alt: "PPO clips the probability ratio so the update cannot go far from the old policy.",
    node: (
      <Svg viewBox="0 0 420 200">
        <line x1="40" y1="100" x2="400" y2="100" stroke={FAINT} />
        <line x1="40" y1="20" x2="40" y2="180" stroke={LINE} strokeWidth={1.25} />
        <line x1="40" y1="180" x2="400" y2="180" stroke={LINE} strokeWidth={1.25} />
        <Label x={20} y={28} size={11} fill={MUTE} weight={500} anchor="start">
          L
        </Label>
        <Label x={400} y={196} size={11} fill={MUTE} weight={500} anchor="end">
          ratio r
        </Label>
        <path d="M40,160 L160,40 L250,40 L250,160 Z" fill="#ecfdf5" stroke={GOOD} strokeWidth={2} />
        <line x1="160" y1="20" x2="160" y2="180" stroke={FAINT} strokeDasharray="4 3" />
        <line x1="250" y1="20" x2="250" y2="180" stroke={FAINT} strokeDasharray="4 3" />
        <Label x={205} y={70} size={11} fill={GOOD}>
          clip
        </Label>
        <Label x={160} y={196} size={11} fill={MUTE} weight={500}>
          1-eps
        </Label>
        <Label x={250} y={196} size={11} fill={MUTE} weight={500}>
          1+eps
        </Label>
      </Svg>
    ),
  },
  "policy-gradient": {
    alt: "A trajectory of states and actions, with later rewards credited back to earlier actions.",
    node: (
      <Svg viewBox="0 0 420 140">
        <Box x={16} y={44} w={70} h={36} label="s0, a0" />
        <Arrow x1={86} y1={62} x2={110} y2={62} />
        <Box x={110} y={44} w={70} h={36} label="s1, a1" />
        <Arrow x1={180} y1={62} x2={204} y2={62} />
        <Box x={204} y={44} w={70} h={36} label="s2, a2" />
        <Arrow x1={274} y1={62} x2={298} y2={62} />
        <Box x={298} y={44} w={70} h={36} label="s3" fill="#ecfdf5" stroke={GOOD} />
        <Label x={151} y={110} size={11} fill={MUTE} weight={500}>
          r1
        </Label>
        <Label x={245} y={110} size={11} fill={MUTE} weight={500}>
          r2
        </Label>
        <Label x={340} y={110} size={11} fill={GOOD}>
          r3
        </Label>
        <Label x={210} y={132} size={11} fill={MUTE} weight={500}>
          Credit later reward back to earlier actions
        </Label>
      </Svg>
    ),
  },
  bellman: {
    alt: "The Bellman backup: a state's value is the expected reward plus the discounted next value.",
    node: (
      <Svg viewBox="0 0 420 140">
        <Box x={40} y={44} w={90} h={44} label="V(s)" />
        <Arrow x1={130} y1={66} x2={170} y2={66} />
        <Box x={170} y={44} w={210} h={44} label="E[r + gamma V(s')]" fill="#ecfdf5" stroke={GOOD} />
        <Label x={210} y={118} size={11} fill={MUTE} weight={500}>
          One-step backup of the value function
        </Label>
      </Svg>
    ),
  },
  "gae-lambda": {
    alt: "GAE mixes short one-step advantages with longer multi-step advantages using lambda.",
    node: (
      <Svg viewBox="0 0 420 150">
        <Box x={16} y={36} w={90} h={40} label="delta_t" />
        <Box x={120} y={36} w={110} h={40} label="delta_t + ... + t+2" />
        <Box x={246} y={36} w={150} h={40} label="full return advantage" />
        <Label x={210} y={100} size={11} fill={MUTE} weight={500}>
          lambda = 0 is TD. lambda = 1 is Monte Carlo.
        </Label>
        <Label x={210} y={122} size={11} fill={ACCENT}>
          GAE is a weighted mix of those
        </Label>
      </Svg>
    ),
  },
  "importance-sampling": {
    alt: "Importance sampling weights can explode when the new policy is far from the behavior policy.",
    node: (
      <Svg viewBox="0 0 420 190">
        <line x1="40" y1="170" x2="400" y2="170" stroke={LINE} strokeWidth={1.25} />
        <line x1="40" y1="20" x2="40" y2="170" stroke={LINE} strokeWidth={1.25} />
        <path d="M40,150 C120,148 180,140 240,120 C280,90 300,40 400,24" fill="none" stroke={BAD} strokeWidth={2.25} />
        <path d="M40,150 C140,148 220,146 400,130" fill="none" stroke={ACCENT} strokeWidth={2} />
        <Label x={250} y={40} size={11} fill={BAD} anchor="start">
          raw IS weight
        </Label>
        <Label x={250} y={120} size={11} fill={ACCENT} anchor="start">
          truncated or clipped
        </Label>
        <Label x={400} y={186} size={11} fill={MUTE} weight={500} anchor="end">
          how far policies diverge
        </Label>
      </Svg>
    ),
  },
  "dpo-pref": {
    alt: "DPO raises the likelihood of the chosen reply relative to the rejected reply, against a reference model.",
    node: (
      <Svg viewBox="0 0 420 150">
        <Box x={16} y={40} w={90} h={44} label="prompt" />
        <Arrow x1={106} y1={52} x2={150} y2={36} />
        <Arrow x1={106} y1={72} x2={150} y2={96} />
        <Box x={150} y={16} w={140} h={40} label="chosen reply" fill="#ecfdf5" stroke={GOOD} />
        <Box x={150} y={80} w={140} h={40} label="rejected reply" fill="#fef2f2" stroke={BAD} />
        <Arrow x1={290} y1={36} x2={330} y2={36} color={GOOD} />
        <Arrow x1={290} y1={100} x2={330} y2={100} color={BAD} />
        <Label x={370} y={40} size={11} fill={GOOD}>
          raise logp
        </Label>
        <Label x={370} y={104} size={11} fill={BAD}>
          lower logp
        </Label>
      </Svg>
    ),
  },
  "grpo-group": {
    alt: "GRPO samples a group of answers for one prompt and scores each one against the group mean.",
    node: (
      <Svg viewBox="0 0 420 170">
        <Box x={16} y={64} w={90} h={40} label="prompt" />
        <Arrow x1={106} y1={84} x2={150} y2={36} />
        <Arrow x1={106} y1={84} x2={150} y2={84} />
        <Arrow x1={106} y1={84} x2={150} y2={132} />
        <Box x={150} y={16} w={120} h={32} label="sample 1, r=1" />
        <Box x={150} y={68} w={120} h={32} label="sample 2, r=0" />
        <Box x={150} y={120} w={120} h={32} label="sample 3, r=1" />
        <Arrow x1={270} y1={84} x2={310} y2={84} />
        <Box x={310} y={64} w={96} h={40} label="r - mean" fill="#ecfdf5" stroke={GOOD} />
        <Label x={210} y={164} size={11} fill={MUTE} weight={500}>
          Advantage is relative to the other samples
        </Label>
      </Svg>
    ),
  },
  "entropy-collapse": {
    alt: "Policy entropy falling toward zero means the model is always picking the same actions.",
    node: (
      <Svg viewBox="0 0 420 180">
        <line x1="40" y1="150" x2="400" y2="150" stroke={LINE} strokeWidth={1.25} />
        <line x1="40" y1="20" x2="40" y2="150" stroke={LINE} strokeWidth={1.25} />
        <path d="M40,40 C120,44 180,50 240,80 C300,130 340,140 400,144" fill="none" stroke={BAD} strokeWidth={2.25} />
        <Label x={20} y={28} size={11} fill={MUTE} weight={500} anchor="start">
          entropy
        </Label>
        <Label x={400} y={168} size={11} fill={MUTE} weight={500} anchor="end">
          training step
        </Label>
        <Label x={220} y={70} size={11} fill={BAD}>
          collapse
        </Label>
      </Svg>
    ),
  },
  "loss-leak": {
    alt: "A training loss that drops almost to zero in a few hundred steps usually means the answer is leaking into the input.",
    node: (
      <Svg viewBox="0 0 420 180">
        <line x1="40" y1="150" x2="400" y2="150" stroke={LINE} strokeWidth={1.25} />
        <line x1="40" y1="20" x2="40" y2="150" stroke={LINE} strokeWidth={1.25} />
        <path d="M40,50 C120,48 200,46 400,40" fill="none" stroke={ACCENT} strokeWidth={2} />
        <path d="M40,50 C80,48 110,80 130,140 L400,146" fill="none" stroke={BAD} strokeWidth={2.25} />
        <Label x={250} y={34} size={11} fill={ACCENT}>
          normal web-text loss, around 3
        </Label>
        <Label x={200} y={120} size={11} fill={BAD}>
          leak, loss near 0
        </Label>
      </Svg>
    ),
  },
  "attention-qk": {
    alt: "Attention computes softmax of Q times K transpose over sqrt d, then multiplies by V.",
    node: (
      <Svg viewBox="0 0 420 120">
        <Box x={10} y={36} w={50} h={40} label="Q" />
        <Label x={74} y={62} size={14}>
          K
        </Label>
        <Label x={90} y={48} size={10} fill={MUTE} weight={500}>
          T
        </Label>
        <Arrow x1={104} y1={58} x2={128} y2={58} />
        <Box x={128} y={36} w={90} h={40} label="scale, mask" />
        <Arrow x1={218} y1={58} x2={240} y2={58} />
        <Box x={240} y={36} w={80} h={40} label="softmax" fill="#ecfdf5" stroke={GOOD} />
        <Arrow x1={320} y1={58} x2={344} y2={58} />
        <Box x={344} y={36} w={60} h={40} label="V" />
        <Label x={210} y={104} size={11} fill={MUTE} weight={500}>
          softmax(Q K^T / sqrt(d) + mask) V
        </Label>
      </Svg>
    ),
  },
  "grad-descent": {
    alt: "Gradient descent steps downhill on a loss surface, with steps getting smaller near a minimum.",
    node: (
      <Svg viewBox="0 0 420 180">
        <ellipse cx="250" cy="110" rx="150" ry="56" fill="none" stroke={FAINT} />
        <ellipse cx="250" cy="110" rx="100" ry="36" fill="none" stroke={FAINT} />
        <ellipse cx="250" cy="110" rx="50" ry="18" fill="none" stroke={FAINT} />
        <circle cx="250" cy="110" r="5" fill={GOOD} />
        <path d="M80,50 L140,70 L180,86 L210,98 L230,106 L250,110" fill="none" stroke={ACCENT} strokeWidth={2.25} />
        <circle cx="80" cy="50" r="4" fill={ACCENT} />
        <Label x={80} y={40} size={11} fill={ACCENT}>
          start
        </Label>
        <Label x={270} y={114} size={11} fill={GOOD} anchor="start">
          min
        </Label>
      </Svg>
    ),
  },
  "flashattention-tiles": {
    alt: "FlashAttention computes attention in tiles so the full score matrix does not have to sit in GPU memory.",
    node: (
      <Svg viewBox="0 0 420 170">
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 4 }).map((_, c) => (
            <rect
              key={`${r}-${c}`}
              x={80 + c * 44}
              y={24 + r * 32}
              width={40}
              height={28}
              rx={3}
              fill={r === 1 && c === 2 ? "#ecfdf5" : FILL}
              stroke={r === 1 && c === 2 ? GOOD : LINE}
              strokeWidth={1}
            />
          )),
        )}
        <Label x={168} y={20} size={12}>
          QK tiles
        </Label>
        <Label x={210} y={164} size={11} fill={MUTE} weight={500}>
          Only one block is in SRAM at a time
        </Label>
      </Svg>
    ),
  },
  "fsdp-shards": {
    alt: "FSDP shards model parameters across GPUs. Each GPU holds one slice and gathers what it needs for a forward pass.",
    node: (
      <Svg viewBox="0 0 420 140">
        <Box x={16} y={36} w={70} h={56} label="GPU 0" fill="#ecfdf5" stroke={GOOD} />
        <Box x={106} y={36} w={70} h={56} label="GPU 1" fill="#ecfdf5" stroke={GOOD} />
        <Box x={196} y={36} w={70} h={56} label="GPU 2" fill="#ecfdf5" stroke={GOOD} />
        <Box x={286} y={36} w={70} h={56} label="GPU 3" fill="#ecfdf5" stroke={GOOD} />
        <Label x={51} y={110} size={10} fill={MUTE} weight={500}>
          shard A
        </Label>
        <Label x={141} y={110} size={10} fill={MUTE} weight={500}>
          shard B
        </Label>
        <Label x={231} y={110} size={10} fill={MUTE} weight={500}>
          shard C
        </Label>
        <Label x={321} y={110} size={10} fill={MUTE} weight={500}>
          shard D
        </Label>
      </Svg>
    ),
  },
  "actor-critic": {
    alt: "An actor-critic has a policy head that picks actions and a value head that scores the state.",
    node: (
      <Svg viewBox="0 0 420 150">
        <Box x={140} y={16} w={140} h={36} label="shared trunk" />
        <Arrow x1={180} y1={52} x2={120} y2={80} />
        <Arrow x1={240} y1={52} x2={300} y2={80} />
        <Box x={50} y={84} w={140} h={40} label="actor, pi(a|s)" fill="#ecfdf5" stroke={GOOD} />
        <Box x={230} y={84} w={140} h={40} label="critic, V(s)" />
      </Svg>
    ),
  },
  "process-vs-outcome": {
    alt: "Outcome rewards score only the final answer. Process rewards score the intermediate steps too.",
    node: (
      <Svg viewBox="0 0 420 150">
        <Box x={16} y={24} w={60} h={32} label="step 1" />
        <Box x={90} y={24} w={60} h={32} label="step 2" />
        <Box x={164} y={24} w={60} h={32} label="step 3" />
        <Box x={238} y={24} w={80} h={32} label="final" fill="#ecfdf5" stroke={GOOD} />
        <Label x={46} y={80} size={11} fill={ACCENT}>
          +p
        </Label>
        <Label x={120} y={80} size={11} fill={ACCENT}>
          +p
        </Label>
        <Label x={194} y={80} size={11} fill={ACCENT}>
          +p
        </Label>
        <Label x={278} y={80} size={11} fill={GOOD}>
          +1 outcome
        </Label>
        <Label x={210} y={116} size={11} fill={MUTE} weight={500}>
          Process scores the steps. Outcome scores only the end.
        </Label>
      </Svg>
    ),
  },
  "sae-sparse": {
    alt: "A sparse autoencoder maps activations to a wider sparse code, then reconstructs the original vector.",
    node: (
      <Svg viewBox="0 0 420 130">
        <Box x={16} y={40} w={90} h={44} label="activation" />
        <Arrow x1={106} y1={62} x2={150} y2={62} />
        <Box x={150} y={28} w={120} h={68} label="sparse code" fill="#ecfdf5" stroke={GOOD} />
        <Arrow x1={270} y1={62} x2={314} y2={62} />
        <Box x={314} y={40} w={90} h={44} label="recon" />
        <Label x={210} y={116} size={11} fill={MUTE} weight={500}>
          Most hidden units are zero
        </Label>
      </Svg>
    ),
  },
  "induction-head": {
    alt: "An induction head looks back at a previous token, then copies the token that followed it last time.",
    node: (
      <Svg viewBox="0 0 420 120">
        <Box x={16} y={36} w={70} h={36} label="A" />
        <Box x={96} y={36} w={70} h={36} label="B" fill="#ecfdf5" stroke={GOOD} />
        <Box x={176} y={36} w={70} h={36} label="..." />
        <Box x={256} y={36} w={70} h={36} label="A" />
        <Box x={336} y={36} w={70} h={36} label="?" fill="#fff7ed" stroke={WARN} />
        <path d="M131,72 C131,100 291,100 291,72" fill="none" stroke={ACCENT} strokeWidth={1.5} />
        <Label x={210} y={112} size={11} fill={ACCENT}>
          After A, copy B
        </Label>
      </Svg>
    ),
  },
  "transformer-block": {
    alt: "A decoder block: residual stream, pre-norm attention, then pre-norm MLP.",
    node: (
      <Svg viewBox="0 0 240 260">
        <Box x={50} y={10} w={140} h={28} label="tokens in" />
        <Arrow x1={120} y1={38} x2={120} y2={52} />
        <Box x={50} y={52} w={140} h={28} label="Norm" />
        <Arrow x1={120} y1={80} x2={120} y2={94} />
        <Box x={50} y={94} w={140} h={28} label="Causal attention" fill="#ecfdf5" stroke={GOOD} />
        <Arrow x1={120} y1={122} x2={120} y2={136} />
        <Box x={50} y={136} w={140} h={28} label="Norm" />
        <Arrow x1={120} y1={164} x2={120} y2={178} />
        <Box x={50} y={178} w={140} h={28} label="MLP" />
        <Arrow x1={120} y1={206} x2={120} y2={220} />
        <Box x={50} y={220} w={140} h={28} label="tokens out" />
        <path d="M190,24 C230,24 230,236 190,236" fill="none" stroke={ACCENT} strokeWidth={1.5} />
      </Svg>
    ),
  },
};

export function hasCardDiagram(key: string | undefined): key is string {
  return Boolean(key && diagrams[key]);
}

export function CardDiagram({ diagram, className }: { diagram: string; className?: string }) {
  const entry = diagrams[diagram];
  if (!entry) return null;
  return (
    <figure className={`w-full overflow-x-auto rounded-md border border-stone-200 bg-white p-3 ${className ?? ""}`}>
      <div className="mx-auto w-full max-w-xl">{entry.node}</div>
      <figcaption className="sr-only">{entry.alt}</figcaption>
    </figure>
  );
}
