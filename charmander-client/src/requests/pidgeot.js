export default {
  get: async (url, data) => {
    const resp = await fetch(`/socket${url}`, {
      method: 'GET',
      body: JSON.stringify(data),
    });

    return {
      status: resp.status,
      data: await resp.json(),
    }
  },
  post: async (url, data) => {
    const resp = await fetch(`/socket${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return {
      status: resp.status,
      data: await resp.json(),
    }
  },
};
