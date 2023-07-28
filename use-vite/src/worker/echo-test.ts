export const request = (value: number) => {
  console.log("Request - ", value);
  return fetch("http://localhost:8080/echo", {
    method: "POST",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify({
      value: value,
    }),
  });
};
