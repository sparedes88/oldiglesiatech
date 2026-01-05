Vue.use(VueMask.VueMaskPlugin);
Vue.directive("mask", VueMask.VueMaskDirective);

Vue.component("vue-country-code", {
  extends: VueCountryCode.default,
});

var app = new Vue({
  el: "#appRegistration",

  template: `
  <div class="row">
  <div class="col-xs-12 col-sm-5 col-md-4 flex-centered pd-2">
    <img
      :src="organization.Logo || 'https://iglesiatech.app/assets/img/logoColor.png'"
      alt=""
      class="responsive-img"
      onerror="this.onerror=null; this.src='https://iglesiatech.app/assets/img/logoColor.png'"
    />
  </div>
  <div class="col-xs-12 col-sm-7 col-md-8">
    <div class="row center-xs has-text-left">
      <div class="col-xs-12 col-md-10" v-if="!registered && !exists && !logged">
        <h1 class="is-size-2 has-text-weight-semibold has-text-centered">
          {{ lang.keys['register'] }}
        </h1>

        <hr />

        <form @submit.prevent="registerUser()">
          <div class="row">
            <div class="col-xs-6">
              <!-- First name -->
              <div class="field">
                <label class="label">
                  {{ lang.keys['first_name'] }}
                </label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="text"
                    :placeholder="lang.keys['your_first_name']"
                    required
                    name="nombre"
                    v-model="userForm.nombre"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-align-left"></i>
                  </span>
                </div>
              </div>
            </div>

            <!-- Last name -->
            <div class="col-xs-6">
              <div class="field">
                <label class="label">
                  {{ lang.keys['last_name'] }}
                </label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="text"
                    :placeholder="lang.keys['your_last_name']"
                    required
                    name="apellido"
                    v-model="userForm.apellido"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-align-left"></i>
                  </span>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="col-xs-12">
              <div class="field">
                <label class="label">Email</label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="email"
                    :placeholder="lang.keys['your_email']"
                    required
                    name="email"
                    v-model="userForm.email"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-at"></i>
                  </span>
                </div>
              </div>
            </div>

            <!-- Sex -->
            <div class="col-xs-6">
              <div class="field">
                <label class="label"> {{ lang.keys['sex'] }} </label>
                <div class="control">
                  <div class="select" style="width: 100%">
                    <select
                      required
                      name="sexo"
                      v-model="userForm.sexo"
                      style="width: 100%"
                    >
                      <option selected disabled :value="''">
                        {{ lang.keys['select_your_sex'] }}
                      </option>
                      <option value="Masculino">
                        {{ lang.keys['male'] }}
                      </option>
                      <option value="Femenino">
                        {{ lang.keys['female'] }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phone -->
            <div class="col-xs-6">
              <div class="field">
                <label class="label">
                  {{ lang.keys['phone_number'] }}
                </label>
                <div class="row">
                  <div class="col-8 col-md-3">
                    <vue-country-code
                      id="country_code_elem"
                      @on-select="onSelect"
                      name="country_code"
                      v-model="userForm.country_code"
                      style="width: 100%; height: 40px"
                      :preferred-countries="['us', 'gb', 'mx']"
                    >
                    </vue-country-code>
                  </div>
                  <div class="col-12 col-md-9">
                    <div class="control has-icons-left">
                      <input
                        class="input"
                        type="text"
                        :placeholder="lang.keys['your_phone_number']"
                        name="telefono"
                        v-model="userForm.telefono"
                        v-mask="'(###) ###-####'"
                      />
                      <span class="icon is-small is-left">
                        <i class="fas fa-phone"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="col-xs-6">
              <div class="field">
                <label class="label"> {{ lang.keys['password'] }} </label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="password"
                    v-model="userForm.password"
                    :placeholder="lang.keys['6_chars_least']"
                    required
                    minlength="6"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-lock"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-xs-6">
              <div class="field">
                <label class="label">
                  {{ lang.keys['confirm_password'] }}
                </label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="password"
                    required
                    :placeholder="lang.keys['confirm_password']"
                    v-model="userForm.passConfirm"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-lock"></i>
                  </span>
                </div>
                <p
                  class="help is-danger"
                  v-if="userForm.password && userForm.password != userForm.passConfirm"
                >
                  {{ lang.keys['password_not_match'] }}
                </p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="col-xs-12 is-flex is-centered is-flex-col">
              <button
                class="button is-itech"
                type="submit"
                :class="{ 'is-loading': loading }"
              >
                {{ lang.keys['create_my_account'] }}
              </button>

              <!-- <p class="center-xs" style="padding: 8px 0px">
                <small> {{ lang.keys['or'] }} </small>
              </p>

              <v-facebook-login
                ref="fbLoginBtn"
                app-id="3117419608270269"
                @login="handleLogin"
                @sdk-init="handleSdkInit"
              ></v-facebook-login> -->
            </div>
          </div>
        </form>
      </div>

      <div
        class="col-xs-12 col-md-10 col-lg-8 center-xs"
        v-if="registered || exists || logged"
      >
        <h1 v-if="registered" class="is-size-2 has-text-weight-semibold">
          {{ lang.keys['account_greeting'] }}
        </h1>

        <h1 v-if="exists" class="is-size-2 has-text-weight-semibold">
          {{ lang.keys['please_login'] }}
        </h1>

        <h1 v-if="logged" class="is-size-2 has-text-weight-semibold">
          {{ lang.keys['logged_now'] }}
        </h1>

        <form 
          v-bind:class="[logged ? 'd-none' : 'd-block']"
         @submit.prevent="makeLogin()" ref="form" id="login_form">
          <div class="row">
            <!-- Email -->
            <div class="col-xs-12">
              <div style="text-align: left" class="field">
                <label class="label"> {{loginForm.login_type}} </label>
                <div
                  v-if="loginForm.login_type === 'Email'"
                  class="control has-icons-left"
                >
                  <input
                    readonly
                    class="input"
                    type="email"
                    :placeholder="lang.keys['your_email']"
                    required
                    name="email"
                    v-model="loginForm.email"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-at"></i>
                  </span>
                </div>

                <div
                  v-if="loginForm.login_type === 'Phone'"
                  class="control has-icons-left"
                >
                  <input
                    readonly
                    class="input"
                    type="text"
                    :placeholder="lang.keys['your_phone_number']"
                    name="telefono"
                    v-model="loginForm.telefono"
                    v-mask="'(###) ###-####'"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-phone"></i>
                  </span>
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="col-xs-12">
              <div style="text-align: left" class="field">
                <label class="label"> {{ lang.keys['password'] }} </label>
                <div class="control has-icons-left">
                  <input
                    class="input"
                    type="password"
                    v-model="loginForm.password"
                    :placeholder="lang.keys['6_chars_least']"
                    required
                    minlength="6"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-lock"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div  class="row center-xs" style="margin-top: 1em">
          <div v-if="!registered && !logged" class="col-xs-12 col-md-6 col-lg-4">
            <ul style="list-style: none;">
              <li>
                <button
                  target="_blank"
                  class="button is-fullwidth secondary"
                  type="button"
                  @click="exists = false"
                >
                  < {{ lang.keys['back'] }}
                </button>
              </li>
            </ul>
          </div>
          <div v-if="exists" class="col-lg-4"></div>
          <div class="col-xs-12 col-md-6 col-lg-4">
            <ul style="list-style: none;">
              <li>
                <a
                  v-if="!exists || logged "
                  :href="login_token ? 'https://iglesiatech.app/login?token=' + login_token : 'https://iglesiatech.app/login'"
                  target="_blank"
                  class="button is-fullwidth citric"
                  type="button"
                >
                {{ lang.keys['my_profile'] }}
                </a>

                <button
                  v-if="exists && !logged"
                  class="button is-fullwidth is-itech"
                  type="submit"
                  :class="{ 'is-loading': loading }"
                  form="login_form"
                >
                  {{ lang.keys['login'] }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,

  /**
   * App Data
   */
  data() {
    return {
      idOrganization: undefined,
      organization: {},
      userForm: {
        nombre: "",
        apellido: "",
        sexo: "",
        telefono: "",
        country_code: "",
        email: "",
        password: "",
        idUserType: "2",
        idIglesia: undefined,
        ciudad: "City",
        calle: "Street",
        provincia: "state",
        estadoCivil: "Soltero",
        niveles: [],
        categorias: [],
      },
      loginForm: {
        telefono: "",
        email: "",
        password: "",
        login_type: "",
      },
      registered: false,
      exists: false,
      logged: false,
      loading: false,
      facebook: {
        FB: {},
        model: {},
        scope: {},
      },
      langDB: undefined,
      currentLang: "en",
    };
  },

  computed: {
    /**
     * Get current lang as object
     */
    lang() {
      if (this.langDB && this.currentLang) {
        return this.langDB.find((l) => l.lang == this.currentLang);
      }
      return {
        keys: {},
      };
    },
  },

  /**
   * App Methods
   */
  methods: {
    /**
     * Register User account
     */
    registerUser() {
      if (this.userForm.password != this.userForm.passConfirm) {
        return alert(this.lang.keys.verify_password);
      }
      if (!this.userForm.country_code) {
        return alert("Please select a country");
      }
      if (
        this.userForm.telefono.includes("(") &&
        this.userForm.telefono.includes(")") &&
        this.userForm.telefono.includes("-") &&
        this.userForm.telefono.includes(" ")
      ) {
        // correct format
        if (this.userForm.telefono.length != 14) {
          return alert(this.lang.keys.phone_incomplete);
        }
      } else {
        return alert(this.lang.keys.incorrect_format);
      }
      // Set loading state
      this.loading = true;

      axios
        .post(
          `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/users/checkUser/`,
          {
            usuario: this.userForm.email,
            idIglesia: this.idOrganization,
            login_type: "email",
          }
        )
        .then((response) => {
          if (
            (response.data.message &&
              response.data.message ===
                "This user exists but not in your organization.") ||
            (response.data.message &&
              response.data.message === "This user exist but was deleted.")
          ) {
            this.loading = false;
            this.exists = true;
            const message = `${this.lang.keys.user_with_email_exists}. ${this.lang.keys.make_login_instead}`;
            const confirmation = confirm(message);
            if (confirmation) {
              this.loginForm.login_type = "Email";
              this.loginForm.telefono = "";
              this.loginForm.email = this.userForm.email;
              return;
            } else {
              this.exists = false;
              return;
            }
          } else {
            // Check Phone
            axios
              .post(
                `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/users/checkUser/`,
                {
                  usuario: this.userForm.telefono,
                  idIglesia: this.idOrganization,
                  login_type: "phone",
                }
              )
              .then((response) => {
                if (
                  (response.data.message &&
                    response.data.message ===
                      "This user exists but not in your organization.") ||
                  (response.data.message &&
                    response.data.message ===
                      "This user exist but was deleted.")
                ) {
                  this.loading = false;
                  this.exists = true;
                  const message = `${this.lang.keys.user_with_phone_exists}. ${this.lang.keys.make_login_instead}`;
                  const confirmation = confirm(message);
                  if (confirmation) {
                    this.loginForm.login_type = "Phone";
                    this.loginForm.email = "";
                    this.loginForm.telefono = this.userForm.telefono;
                    return;
                  } else {
                    this.exists = false;
                    return;
                  }
                }

                // Set id iglesia
                this.userForm.idIglesia = this.idOrganization;

                // Crypt pass
                this.userForm.pass = this.encryptPass(this.userForm.password);
                this.userForm.create_token = true;
                axios
                  .post(
                    `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/insertUsuario/`,
                    this.userForm
                  )
                  .then((response) => {
                    this.registered = true;
                    this.loading = false;
                    this.login_token = response.data.login_token;
                  })
                  .catch((error) => {
                    this.registered = true;
                    this.loading = false;
                  });
              })
              .catch((error) => {
                return alert(this.lang.keys.user_with_phone_exists);
                this.loading = false;
              });
          }
        })
        .catch((error) => {
          return alert(this.lang.keys.user_with_email_exists);
          this.loading = false;
        });
    },

    encryptPass(pass) {
      // const CryptoJS = crypto;
      const apiKey = pass;
      const apiSecret = "VVhwTmVVNHlVbWhPVjFsNVVrRTlQUT09";
      const key = CryptoJS.enc.Base64.parse(apiSecret);
      const prehash = CryptoJS.enc.Utf8.parse(apiKey);
      const hash = CryptoJS.HmacSHA256(prehash, key);
      const signature = hash.toString(CryptoJS.enc.Base64);
      return encodeURIComponent(signature);
    },

    getUserData() {
      this.facebook.FB.api(
        "/me",
        { fields: "id,first_name,last_name,email" },
        (user) => {
          this.userForm.nombre = user.first_name;
          this.userForm.apellido = user.last_name;
          this.userForm.email = user.email;
          this.userForm.password = user.id;
          this.userForm.passConfirm = user.id;

          this.registerUser();
        }
      );
    },

    getIglesia() {
      axios
        .get(
          `https://iglesia-tech-api.e2api.com/api/getIglesiaFullData?idIglesia=${this.idOrganization}`
        )
        .then((response) => {
          this.organization = response.data.iglesia;
        })
        .catch((error) => {
          console.error(error);
        });
    },

    handleLogin() {
      this.getUserData();
    },

    handleSdkInit({ FB, scope }) {
      this.facebook.scope = scope;
      this.facebook.FB = FB;
    },

    /**
     * Get languages database
     */
    getLangs() {
      axios
        .get(
          "https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/langs"
        )
        .then((response) => {
          this.langDB = response.data;
        })
        .catch((error) => {
          console.log(error.response);
        });
    },
    makeLogin() {
      this.loading = false;
      let user;
      if (this.loginForm.login_type === "Email") {
        user = this.loginForm.email;
      } else {
        user = this.loginForm.telefono;
      }
      const hashedPwd = this.encryptPass(this.loginForm.password);
      this.userForm.create_token = true;
      axios
        .post(
          `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/users/login_v2/`,
          {
            usuario: user,
            pass: hashedPwd,
          }
        )
        .then((response) => {
          if (response.data.users.length > 0) {
            const user = response.data.users[0];
            this.login_token = user.login_token;
            const url = `https://iglesiatech.app/login?token=${this.login_token}`;
            window.open(url, "_blank");
            this.logged = true;
            this.exists = false;
          }
          this.loading = false;
          // this.registered = false;
          // this.exists = false;
        })
        .catch((error) => {
          // this.registered = true;
          this.loading = false;
        });
    },
    onSelect({ name, iso2, dialCode }) {
      console.log(name, iso2, dialCode);
      this.userForm.country_code = `+${dialCode}`;
    },
  },

  mounted() {
    this.idOrganization = IDIGLESIA;

    this.currentLang = LANG || "en";

    console.log(this.currentLang);

    this.getLangs();
    this.getIglesia();
  },
});
