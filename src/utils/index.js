import axios from "axios";

export const GithubApi = (token) => {
  const ax = axios.create({
    baseURL: "https://api.github.com/",
    timeout: 5000,
    headers: { Authorization: `token ${token}` },
  });

  return {
    usernameExists: async (username) => {
      try {
        // just a head so it'll be quick
        await ax.head(`users/${username}`);
        // and if we don't error out, we know it's gucci
        return true;
      } catch (err) {
        // otherwise no good
        return false;
      }
    },
    getRepos: async (username) => {
      try {
        // grab all their repos
        const { data: repos } = await ax.get(`users/${username}/repos`);
        // and just give them
        return repos;
      } catch (err) {
        // otherwise no good
        console.error(err);
        return [];
      }
    },
    getEmails: (user) => async (repo) => {
      try {
        // axios (not ax) because we want from OUR server, not github
        const { data: emails } = await axios.get(`/git/${user}/${repo}.json`);
        return emails;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
  };
};
