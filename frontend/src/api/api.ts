import axios from "axios";

// export default
class Api {
  public user: any;
  public friends: any;

  constructor() {
    this.user = {
      login: async (data) => {
        return await this.call("/auth/42", { method: "get", data });
      },
      logout: async (data) => {
        return await this.call("/auth/logout", { method: "post", data });
      },
      isAuthenticated: async (data) => {
        return await this.call("/auth/valid", { method: "get", data });
      },
      updateNickname: async (data) => {
        return await this.call("/user/nickname", { method: "post", data });
      },
      updateAvatar: async (data) => {
        return await this.call("/user/avatar", {
          method: "post",
          data,
          headers: { "Content-Type": "multipart/form-data" },
        });
      },
      get: async (data) => {
        return await this.call("/user", { method: "get", data });
      },
      addUser: async (data) => {
        return await this.call("/user", { method: "post", data });
      },
    };
    this.friends = {
      get: async (data) => {
        return await this.call("/friends", { method: "get", data });
      },
      add: async (data) => {
        return await this.call("/friends/add", { method: "post", data });
      },
      remove: async (data) => {
        return await this.call("/friends/remove", { method: "delete", data });
      },
    };
    console.log("Api constructor done");
    console.log(this.user);
  }

  async call(path, { method = "get", data, parameters = {}, headers = {} }) {
    const queryParameters = Object.keys(parameters)
      .map((key) => `${key}=${encodeURIComponent(parameters[key])}`)
      .join("&");
    const url = `http://${location.hostname}:3000${path}`; //?${queryParameters}`;
    // headers["Access-Control-Allow-Origin"] = "http://localhost:8080 ";
    console.log("DEBUG: call api: ", path, method, data, headers);
    try {
      const response = await axios.request({
        url: url,
        method: method,
        data: data,
        // headers: headers,
        withCredentials: true,
      });
      return response;
    } catch (error) {
      // console.log("Api call error", error.response.data);
      return error.response;
    }
  }
}

const api = new Api();

export default api;
