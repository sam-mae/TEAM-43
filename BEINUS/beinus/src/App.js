import logo from "./logo.svg";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ManagePage from "./pages/ManagePage";
import SearchPage from "./pages/SearchPage";
import BatteryListPage from "./pages/BatteryListPage";
import MaterialListPage from "./pages/MaterialListPage";
import MaterialDetailPopup from "./pages/MaterialDetailPopup";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainPage />}></Route>
                    <Route path="/login" element={<LoginPage />}></Route>
                    <Route path="/register" element={<RegisterPage />}></Route>
                    <Route path="/manage" element={<ManagePage />}></Route>
                    <Route
                        path="/search/:batteryID/"
                        element={<SearchPage />}
                    ></Route>
                    <Route
                        path="/battery"
                        element={<BatteryListPage />}
                    ></Route>
                    <Route
                        path="/material"
                        element={<MaterialListPage />}
                    ></Route>
                    <Route
                        path="/material_detail/:materialID/"
                        element={<MaterialDetailPopup />}
                    ></Route>
                    {/* <Route path="/material" element={<MaterialListPage />}></Route> */}
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
