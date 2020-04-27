import axios from "axios";
import { exec } from "child-process-promise";
import { Email, Repo } from "../../../db";
const GIT_ERROR_MSG = "Invalid repo or user (or insufficient permissions)";
const SQL_ERROR_MSG = "Oops, something broke! try again later";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

// when do we refresh the saved emails?
const REFRESH_PERIOD = 1 * DAY;

const is_valid_repo = async (user, repo) => {
  try {
    await axios.head(`https://github.com/${user}/${repo}`);
    return true;
  } catch (err) {
    return false;
  }
};

const get_emails_from_repo = async (repo_path) => {
  const delim = " - ";
  const cmd = await exec(
    `cd ${repo_path} && git log --pretty=format:"%an${delim}%ae" | sort | uniq`
  );
  if (cmd.stderr) throw cmd.stderr;

  const emails = cmd.stdout
    .trim()
    .split("\n")
    .map((line) => {
      const [name, email] = line.split(delim);
      return { name, email };
    });

  return emails;
};

const download_repo = (user, repo, repo_path) => {
  return exec(
    `git clone --bare https://github.com/${user}/${repo} ${repo_path}`
  );
};

const mktemp_dir = async () => {
  const { stdout: dir } = await exec(`mktemp --directory`);
  return dir.trim();
};

const remove_repo = (repo_path) => {
  return exec(`rm -rf ${repo_path}`);
};

const fetch_emails = async (user, repo) => {
  const repo_path = await mktemp_dir();
  try {
    if (!(await is_valid_repo(user, repo.name))) {
      throw new Error("404");
    }
    await download_repo(user, repo.name, repo_path);

    const raw_emails = await get_emails_from_repo(repo_path);
    return raw_emails;
  } catch (err) {
    throw err;
  } finally {
    remove_repo(repo_path);
  }
};

export async function get(req, res) {
  const { user, repo: repo_name } = req.params;
  if (user.includes(".") || user.includes("/")) {
    res.status(403).send(GIT_ERROR_MSG);
    return;
  }

  if (repo_name.includes(".") || repo_name.includes("/")) {
    res.status(403).send(GIT_ERROR_MSG);
    return;
  }
  try {
    const [repo, created] = await Repo.findOrCreate({
      where: {
        user,
        name: repo_name,
      },
    });
    const now = new Date();
    const diff = now - repo.updatedAt;
    const youngerThanRefreshPeriod = diff < REFRESH_PERIOD;
    console.log({
      created,
      youngerThanRefreshPeriod,
      diff,
      repo: repo.dataValues,
    });

    // did it exist before?
    // if yes, has it been a short time since we updated it?
    // Maybe just return the emails we have already
    if (!created && youngerThanRefreshPeriod) {
      const emails = await repo.getEmails();
      res.json(
        emails.map((email) => ({
          name: email.name,
          email: email.email,
        }))
      );
      return;
    }
    // make sure it updates 'updatedAt' col.
    // need to set this to curr time for future calls
    repo.changed("updatedAt", true);
    await repo.save();

    // if it hasn't existed, continue and fetch new stuff
    const raw_emails = await fetch_emails(user, repo);
    const emails = await Email.bulkCreate(raw_emails);
    repo.setEmails(emails);

    res.json(
      emails.map((email) => ({
        name: email.name,
        email: email.email,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).end(SQL_ERROR_MSG);
  }
}
