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
        return await this.call("/auth/valid", { method: "post", data });
      },
      update: async (data) => {
        return await this.call("/user/update", { method: "put", data });
      },
      get: async (data) => {
        return await this.call("/user", { method: "post", data });
      },
    };
    this.friends = {
      get: async (data) => {
        return await this.call("/friends", { method: "post", data });
      },
      add: async (data) => {
        return await this.call("/friends/add", { method: "post", data });
      },
      remove: async (data) => {
        return await this.call("/friends/remove", { method: "post", data });
      },
    };
    console.log("Api constructor done");
    console.log(this.user);
  }

  async call(path, { method = "get", data, parameters = {} } = {}) {
    const queryParameters = Object.keys(parameters)
      .map((key) => `${key}=${encodeURIComponent(parameters[key])}`)
      .join("&");
    const url = `http://${location.hostname}:3000${path}`; //?${queryParameters}`;
    try {
      const response = await axios.request({
        url: url,
        method: method,
        data: data,
        headers: {
          "Access-Control-Allow-Origin": `*`, // "http://localhost:3000", change that
        },
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
