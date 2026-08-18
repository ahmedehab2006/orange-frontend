import { BrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;