// Trivial example component with no service dependency — proves Alpine wiring
// works on its own, independent of the microservice layer.
export function counter() {
  return {
    count: 0,
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
  };
}
