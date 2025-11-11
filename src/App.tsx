import "./App.css";
import { ToastProvider } from "./components";
import { AppRoutes } from "./routes";

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
