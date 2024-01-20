export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint)
      .then((data) => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find(
        (entry) => entry.login.toLowerCase() === username.toLowerCase()
      );

      if (userExists) {
        throw new Error("Usuário já cadastrado!");
      }

      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("O usuário não foi encontrado!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch {
      alert(error.message);
    }
  }

  delete(user) {
    this.entries = this.entries.filter((entry) => entry.login !== user.login);
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("table tbody");

    this.update();
    this.onAdd();
  }

  update() {
    this.removeAllTr();

    this.createEmptyTable();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Imagem do usuário ${user.name}.`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user a p").textContent = user.name;
      row.querySelector(".user a span").textContent = `/${user.login}`;

      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar este favorito?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  onAdd() {
    const addButton = this.root.querySelector("#search input[type=button]");

    addButton.onclick = () => {
      const { value } = this.root.querySelector("#search input[type=text]");

      this.add(value);
    };
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <tr>
      <td class="user">
        <img
          src=""
          alt=""
        />

        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
        >
          <p></p>
          <span></span>
        </a>
      </td>

      <td class="repositories">60</td>
      <td class="followers">47</td>
      <td>
        <button class="remove">Remove</button>
      </td>
    </tr>
    `;

    return tr;
  }

  createEmptyTable() {
    const isEmpty = this.entries.length == 0;

    if (isEmpty) {
      const emptyRow = document.createElement("tr");

      emptyRow.innerHTML = `     
        <td class="empty" colspan="4">
          <div>
            <img src="./assets/Estrela.svg" alt="Imagem de uma estrela."/>
            <p>Nenhum favorito ainda!</p>
          </div>
        </td>
      `;

      emptyRow.classList.add("empty-table");
      this.tbody.append(emptyRow);
    }
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
