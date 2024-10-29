import axios from "axios";

export class LoginError extends Error {
    constructor() {
        super("로그인이 필요한 기능입니다.");
        this.name = "Login Error";
        this.navigate = "/login";
    }
}

export class PermissionError extends Error {
    constructor() {
        super("권한이 부족합니다.");
        this.name = "Permission Error";
    }
}

export const instance = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 1000,
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    // console.log(token);
    if (token && token !== "undefined") {
        // console.log(token);
        config.headers["Authorization"] = `Bearer ${token}`;
    } else {
        console.log("no token");
    }
    return config;
});

instance.interceptors.response.use(
    (response) => {
        if (response.status === 200) {
            return response;
        }
    },
    (error) => {
        localStorage.removeItem("token");
        // console.log(error);
        return Promise.reject(error);
    }
);

export const getUser = (data) => {
    return instance.get("/", {});
};

export const register = (data) => {
    const { password, username, org } = data;
    const body = {
        username: username,
        password: password,
        org: org,
    };
    return instance.post("/join", body);
};

export const login = (data) => {
    const { username, password } = data;
    const body = {
        username: username,
        password: password,
    };
    return instance.post("/login", body);
};
