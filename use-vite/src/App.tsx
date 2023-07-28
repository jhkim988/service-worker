function App() {
  const onClick = async () => {
    const status = await navigator.permissions.query({
      name: "periodic-background-sync",
    });
    console.log(status);
    if (status.state === "granted") {
      const registration = await navigator.serviceWorker.ready;
      if ("periodicSync" in registration) {
        try {
          await registration.periodicSync.register("content-sync", {
            minInterval: 1000,
          });
          console.log("onclick");
        } catch (error) {
          console.error(error);
          // Periodic background sync cannot be used.
        }
      }
    }
  };
  return <button onClick={onClick}>Periodic Sync</button>;
}

export default App;
