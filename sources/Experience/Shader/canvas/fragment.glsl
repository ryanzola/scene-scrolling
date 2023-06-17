varying vec2 vUv;
uniform float progress;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;

void main() {
  vec4 t1 = texture2D(uTexture1, vUv);
  vec4 t2 = texture2D(uTexture2, vUv);

  float sweep = step(vUv.y, progress);

  vec4 finalTexture = mix(t1, t2, sweep);

  gl_FragColor = finalTexture;
}