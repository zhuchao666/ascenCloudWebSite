// =============================================
// 片段着色器 — 云卷云舒效果核心
// =============================================
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uImgAspect;

varying vec2 vUv;

// =========================================
// 3D Simplex Noise
// =========================================
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// =========================================
// 旋转矩阵 — 打断各 FBM 层之间的轴对齐
// =========================================
mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

// =========================================
// FBM — 5 层 + 非均匀旋转，有机感更强
// =========================================
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    val += amp * snoise(p * freq);
    // 每层旋转角度不同，打破规律性
    p.xy = rot(0.65 + float(i) * 0.12) * p.xy;
    p.z += 0.37;
    freq *= 2.05;   // 略大倍率让高频细节更丰富
    amp *= 0.48;     // 衰减稍快，避免高频噪点
  }
  return val;
}

// 带时间偏移的 FBM 变体 — 不同种子产生不相关的噪声场
float fbmT(vec3 p, float seed) {
  return fbm(p + vec3(seed * 7.23, seed * 3.91, seed * 5.17));
}

// 带时间的柔和噪声 — 用于缓慢的大尺度变形
float softNoise(vec2 uv, float t, float seed) {
  return snoise(vec3(uv * 0.8 + seed * 3.7, t * 0.03));
}

// =========================================
// 云涌动 — 多尺度噪声驱动，非线性节奏
// =========================================
vec2 cloudWarp(vec2 uv, float t) {
  // --- 第1层: 大尺度云团缓慢漂移与变形 ---
  // 用极慢的时间驱动，产生云团整体的"呼吸感"
  float t1 = t * 0.035;
  // 加入正弦呼吸节奏，让速度有快有慢，不再匀速
  float breath = sin(t * 0.02) * 0.3 + 0.7;  // 0.4~1.0 之间波动
  vec2 q;
  q.x = fbmT(vec3(uv * 1.4, t1), 0.0) * breath;
  q.y = fbmT(vec3(uv * 1.4 + 4.3, t1 + 0.7), 1.0) * breath * 0.6;  // y方向更柔和

  // --- 第2层: 中尺度云团边缘卷曲 ---
  float t2 = t * 0.065;
  vec2 warped1 = uv + q * 0.06;  // 被第1层轻微带动
  vec2 r;
  r.x = fbmT(vec3(warped1 * 2.4, t2 + 1.9), 2.0);
  r.y = fbmT(vec3(warped1 * 2.4 + 7.1, t2 + 3.3), 3.0) * 0.7;

  // --- 第3层: 细碎云丝微颤 ---
  float t3 = t * 0.12;
  vec2 warped2 = uv + q * 0.04 + r * 0.03;
  vec2 s;
  s.x = fbmT(vec3(warped2 * 3.8, t3 + 5.2), 4.0);
  s.y = fbmT(vec3(warped2 * 3.8 + 11.3, t3 + 7.8), 5.0) * 0.5;

  // 混合：大结构主导方向，中层添加卷曲，小层添加细节
  // 水平方向（x）扭曲更强，模拟云被风横向推动
  vec2 result;
  result.x = q.x * 0.52 + r.x * 0.32 + s.x * 0.16;
  result.y = q.y * 0.38 + r.y * 0.38 + s.y * 0.24;

  return result;
}

void main() {
  // -----------------------------------------------
  // 1. Cover UV — 让图片 cover 全屏（类似 CSS background-size: cover）
  // -----------------------------------------------
  float screenAspect = uResolution.x / uResolution.y;
  vec2 coverUv = vUv;

  if (screenAspect > uImgAspect) {
    float sc = screenAspect / uImgAspect;
    coverUv.y = (vUv.y - 0.5) / sc + 0.5;
  } else {
    float sc = uImgAspect / screenAspect;
    coverUv.x = (vUv.x - 0.5) / sc + 0.5;
  }

  // -----------------------------------------------
  // 2. 鼠标视差
  // -----------------------------------------------
  vec2 baseUv = coverUv + uMouse;

  // -----------------------------------------------
  // 3. 先采样原图 — 用亮度辅助判断云层位置
  // -----------------------------------------------
  vec4 origColor = texture2D(uTexture, clamp(baseUv, 0.001, 0.999));
  float luma = dot(origColor.rgb, vec3(0.299, 0.587, 0.114));

  // -----------------------------------------------
  // 4. 云层 mask — 分区域控制涌动强度
  //    天空区: 几乎不动
  //    云天交界: 翻涌最活跃（云团边缘翻卷）
  //    云层深处: 柔缓蠕动
  // -----------------------------------------------
  // y 坐标 mask: 下方是云
  float yMask = smoothstep(0.70, 0.35, coverUv.y);
  // 亮度 mask: 白色区域更像云
  float lumaMask = smoothstep(0.35, 0.72, luma);
  // 基础云 mask
  float cloudMask = max(yMask * 0.65, lumaMask * 0.55);

  // 云天交界处翻涌最活跃 (y ≈ 0.35~0.55)
  float edgeBand = smoothstep(0.60, 0.48, coverUv.y) * smoothstep(0.28, 0.40, coverUv.y);
  cloudMask = max(cloudMask, edgeBand * 0.85);
  cloudMask = smoothstep(0.05, 0.55, cloudMask);

  // -----------------------------------------------
  // 5. 云涌动扭曲
  // -----------------------------------------------
  vec2 warp = cloudWarp(baseUv, uTime);

  // 涌动强度: 云天交界处最强，深处稍弱，天空最弱
  // 加入噪声调制让强度空间不均匀（有些地方涌动大有些地方小）
  float localVariation = softNoise(baseUv, uTime, 10.0) * 0.3 + 0.85;  // 0.55~1.15
  float warpAmt = cloudMask * 0.024 * localVariation;

  // 云天交界处额外增强涌动
  warpAmt += edgeBand * 0.008 * localVariation;

  vec2 finalUv = baseUv + warp * warpAmt;
  finalUv = clamp(finalUv, 0.001, 0.999);

  // -----------------------------------------------
  // 6. 最终采样
  // -----------------------------------------------
  vec4 color = texture2D(uTexture, finalUv);
  gl_FragColor = color;
}
