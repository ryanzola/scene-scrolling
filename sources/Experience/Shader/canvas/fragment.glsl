varying vec2 vUv;
varying vec2 vUv1;
uniform float progress;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float time;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

float tri(float p) {
  return mix(p, 1.0 - p, step(0.5, p)) * 2.0;
}

void main() {
  float accel = 0.1;
  float p = progress;
  vec2 vUv1 = vUv;

  float delayValue = p * 7.0 - vUv.y * 2.0 + vUv.x - 2.0;
  delayValue = clamp(delayValue, 0.0, 1.0);

  vec2 translateValue = vec2(p) + delayValue * accel;
  vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;
  vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - accel);

  vec2 w = sin( sin(time) * vec2(0.0, 0.3) + vUv.yx * vec2(0.0, 4.0)) * vec2(0.0, 0.5);
  vec2 xy = w * (tri(p) * 0.5 + tri(delayValue) * 0.5);

  vec2 uv1 = vUv1 + translateValue1 + xy;
  vec2 uv2 = vUv1 + translateValue2 + xy;

  vec4 rgba1 = texture2D(uTexture1, mirrored(uv1));
  vec4 rgba2 = texture2D(uTexture2, mirrored(uv2));

  vec4 rgba = mix(rgba1, rgba2, delayValue);

  gl_FragColor = rgba;
}