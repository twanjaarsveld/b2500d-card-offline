const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

if (!LitElement) {
  console.error("B2500D-Card-Offline: Could not find LitElement locally.");
}

// 1. LANGUAGES
var en = {
  "errors": {
    "both": "Please specify either 'device' or 'entities', not both.",
    "missing": "You must provide either 'device' or 'entities'.",
    "entities_invalid" : "Only [p1_power + p2_power] or [p1_power + p2_power + p3_power + p4_power] are allowed",
  },
  "labels": {
    "last_update": "Last Update",
    "simul_charge": "Simultaneous Charging/Discharging",
    "full_then_discharge": "Fully Charge Then Discharge",
    "charging_mode": "Charging Mode",
    "discharge_mode": "Automatic Discharge Mode",
    "surplus": "Surplus"
  },
  "card": {
    "solar": "Solar Power",
    "output": "Output",
    "realtime": "Realtime Power",
    "battery": "Battery",
    "production": "Production",
    "today": "Today",
    "settings": "Settings"
  },
  "editor": {
    "name": "Card Name",
    "device": "Device ID (e.g. b2500d)",
    "entities": "Alternative Entities (object)",
    "compact": "Compact View",
    "icon": "Show storage icon",
    "solar": "Show Solar",
    "output": "Show Output",
    "battery": "Show Battery",
    "production": "Show Production",
    "settings": "Show Settings",
    "max_input_power": "Maximum Input Power (W)",
    "custom_settings": "Custom Settings",
  },
  "helpers": {
    "device": "Enter the device short name (only ONE: either device OR entities).",
    "entities": "Alternative: object with entities (e.g. { \"solar_power\": \"sensor.x\" })",
    "compact": "Shows a more compact version of the card",
    "icon": "Hide the storage icon",
    "settings": "Only shown if device ID is used",
    "max_input_power": "Maximum input power string 1",
    "max_input_power2": "Maximum input power string 2",
    "max_input_power3": "Maximum input power string 3",
    "max_input_power4": "Maximum input power string 4",
    "custom_settings": "Add your custom settings here (entities mode only)",
  }
};

var nl = {
  "errors": {
    "both": "Specificeer ofwel een 'device' of 'entities', niet beide.",
    "missing": "Je moet ofwel een 'device' of 'entities' opgeven.",
    "entities_invalid" : "Enkel [p1_power + p2_power] of [p1_power + p2_power + p3_power + p4_power] zijn toegestaan",
  },
  "labels": {
    "last_update": "Laatste update",
    "simul_charge": "Gelijktijdig laden/ontladen",
    "full_then_discharge": "Volledig laden en dan ontladen",
    "charging_mode": "Laadmodus",
    "discharge_mode": "Automatische ontlaadmodus",
    "surplus": "Overschot"
  },
  "card": {
    "solar": "Zonne-energie",
    "output": "Uitvoer",
    "realtime": "Realtime vermogen",
    "battery": "Batterij",
    "production": "Productie",
    "today": "Vandaag",
    "settings": "Instellingen"
  },
  "editor": {
    "name": "Kaartnaam",
    "device": "Device ID (bv. b2500d)",
    "entities": "Alternatieve entiteiten (object)",
    "compact": "Compacte weergave",
    "icon": "Opslagpictogram weergeven",
    "solar": "Toon zonne-energie",
    "output": "Toon uitvoer",
    "battery": "Toon batterij",
    "production": "Toon productie",
    "settings": "Toon instellingen",
    "max_input_power": "Maximaal invoervermogen (W)",
    "custom_settings": "Aangepaste instellingen",
  },
  "helpers": {
    "device": "Voer de korte naam van het apparaat in (slechts ÉÉN: of device OF entities).",
    "entities": "Alternatief: object met entiteiten (bv. { \"solar_power\": \"sensor.x\" })",
    "compact": "Toont een compactere versie van de kaart",
    "icon": "Opslagpictogram verbergen",
    "settings": "Alleen zichtbaar als een Device ID wordt gebruikt",
    "max_input_power": "Maximaal ingangsvermogen string 1",
    "max_input_power2": "Maximaal ingangsvermogen string 2",
    "max_input_power3": "Maximaal ingangsvermogen string 3",
    "max_input_power4": "Maximaal ingangsvermogen string 4",
    "custom_settings": "Voeg hier je aangepaste instellingen toe (alleen in entities-modus)",
  }
};

const languages = { en, nl };

function _getLangCode(langInput) {
  const raw = (langInput || (typeof navigator !== "undefined" && navigator.language) || "en").toString().toLowerCase();
  return raw.split(/[_-]/)[0]; 
}

function localize(key, langInput) {
  const lang = _getLangCode(langInput);
  let result = languages[lang] || languages["en"];
  const parts = key.split(".");
  for (const p of parts) {
    result = result ? result[p] : null;
    if (!result) break;
  }
  return result || "";
}

// 2. THE CARD CLASS
class B2500DCard extends LitElement {
  static get properties() {
    return {
      _hass: {},
      config: {},
    };
  }

  static getConfigElement() {
    return document.createElement("b2500d-card-Offline-editor");
  }

  static getStubConfig() {
    return {
      solar: true,
      battery: true,
      output: true,
      production: true,
      settings: true
    };
  }

  static get styles() {
    return css`
      :host {
        --text:var(--primary-text-color);
        --muted:var(--primary-text-color);
        --cyan:#58d0ff;
        --cyan-soft:#3bbcf0;
        --divider: var(--entities-divider-color,var(--divider-color));
        --radius:22px;
        display:block;
      }

      .container {
        width:100%;
        max-width:600px;
        margin:0 auto;
        padding:18px 14px 26px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        backdrop-filter: var(--ha-card-backdrop-filter, none);
        box-shadow: var(--ha-card-box-shadow, none);
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, 12px);
        border-width: var(--ha-card-border-width, 1px);
        border-style: solid;
        border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        color: var(--primary-text-color);
      }

      .device {
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:14px;
        padding:6px 0 14px
      }

      .device .unit {
        width:80px;
        height:130px;
        border-radius:18px;
        background:#68686A;
        background:linear-gradient(135deg,#68686A 0%,#48484a 45%,#5a5a5c 100%);
        box-shadow: inset 0 2px 0 rgba(255,255,255,.05), inset 0 -8px 16px rgba(0,0,0,.45);
        position:relative;
        display:flex;
        align-items:center;
        justify-content:center;
      }
    
      .unit .battery-bar {
        width: 10px;
        height: 80px;
        border-radius: 6px;
        border: 1px solid #000;
        background: rgb(28, 28, 28);
        position:relative;
        overflow:hidden;
        display:flex;
        justify-content:center;
      }
    
      .unit .battery-fill {
        position:absolute;
        bottom:2px;
        width:4px;      
        background:linear-gradient(#5be5bf, #2ae5a8);
        box-shadow:0 0 3px #5be5bf;
        border-radius:2px;
        height:0%;           
        transition:height .6s ease;
      }
    
      .unit .battery-fill.charging {
        background:linear-gradient(#5be5bf, #2ae5a8);
        box-shadow:0 0 6px #5be5bf;
        animation:pulseGreen 2.5s infinite ease-in-out;
      }
    
      @keyframes pulseGreen {
        0%,100% { opacity:0.6; transform:scaleY(0.95); }
        50%     { opacity:1;   transform:scaleY(1.05); }
      }
    
      .unit .battery-fill.discharging {
        background:linear-gradient(#ff9800, #ff5722);
        box-shadow:0 0 6px #ff9800;
        animation:pulseOrange 2.5s infinite ease-in-out;
      }
    
      @keyframes pulseOrange {
        0%,100% { opacity:0.6; transform:scaleY(0.95); }
        50%     { opacity:1;   transform:scaleY(1.05); }
      }

      .grid {
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:14px;
      }

      .solar {
        grid-column: 1 / -1;
        padding:18px;
      }

      .battery-card {
        grid-row: span 2;
        display:flex;
        flex-direction:column;
      }

      .card {
        position: relative; 
        background: rgba(100,100,100, 0.15);
        border-radius: var(--radius);
        padding:12px;
        box-sizing:border-box;
      }
        
      .icon {
        position: absolute;
        bottom: 14px;   
        right: 14px;   
        font-size: 22px; 
        color:var(--text);
        font-weight: 700;
      }
        
      ha-icon[icon="mdi:battery-high"] {
        transform: rotate(90deg);
        transform-origin: center;
        backface-visibility: hidden;
        will-change: transform;
        display: inline-block;
      }
        
      .card.flat{ 
        box-shadow:none; 
        padding:0; 
        overflow: visible;
      }

      .title {
        display:flex; 
        align-items: baseline; 
        gap:1px;
        font-weight:600; 
        color:var(--text);
        font-size: var(--ha-font-size-l);
        margin-bottom: 10px;
      }

      .right-big {
        margin-left:auto; 
        font-weight:400; 
        font-size:24px; 
        color:var(--text);
      }

      .big-num{ font-size:24px; color:var(--text); font-weight:400; }
      .muted{ color:var(--muted) }
      .subtitle{ color:var(--muted); font-size:13px; margin-top:15px }
      
      .big-num-unit{
          font-size:14px;
          font-weight:400;
          margin-left: 1px;
          color: var(--primary-text-color);
      }
      .big-num-unit.white {
        color: white;
      }

      .flex-wrapper{
            display: flex;
            align-items: baseline;
      }

      .barwrap{ margin-top:8px; display:flex; gap:12px; align-items:center; }
      .bar{
        background: #1C1C1C; 
        border-radius:12px; height:3px; flex:1; position:relative; overflow:hidden;
      }
      .bar .fill{
        position:absolute; left:0; top:0; bottom:0; width:0%;
        background: rgb(84, 158, 164);
        border-radius:12px;
        transition: width .6s ease;
      }
      .bar.r .fill{
        right:0; left:auto;
        background: rgb(84, 158,164);
      }
      .barlabels{ display:flex; justify-content:space-around; margin-top:8px; font-weight:400; color: #549EA4; align-items: center; }
      .barlabels .hint{ color: #549EA4; font-weight:400; font-size:12px; margin-top:2px; }

      .battery{
        display:flex; align-items:center; justify-content:center; padding:10px 0 4px;
      }

      .ring {
        position: relative; 
        width:150px;
        height:150px;
        border-radius:50%;
        display:grid;
        place-items:center;
        padding: 6px; 
        box-sizing: border-box;
        overflow: visible; 
      }
        
      .ring::before {
        content: "";
        position: absolute;
        inset: -3px;              
        border-radius: 50%;
        background: inherit;     
        filter: blur(8px);      
        opacity: 0.6;           
        z-index: 0;
      }
        
      .ring > .inner {
        position: relative;
        z-index: 1; 
      }
        
      .inner {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(
          var(--ha-card-background-rgb, 28,28,28),
          1
        );
        display: grid;
        place-items: center;
      }
        
      .pulse-green {
        color: #5be5bf;
        scale: 0.8;
        animation: pulseGreen 2.5s infinite ease-in-out;
      }

     .kwh{ font-size:28px; font-weight:400; color: white; }

      .percent{ 
        color: white;
        margin-top:2px; 
        font-weight:400; 
        font-size: var(--ha-font-size-l) 
      }

      .row{
        display:flex; align-items:center; justify-content:space-between; gap:10px;
        padding:18px; 
      }
      .row .left{ display:flex; align-items:center; gap:12px; }
      .row .right{ color:var(--muted); font-weight:600; display:flex; align-items:center; }
      .chev{ width:10px; height:10px; border-right:2px solid var(--muted); border-top:2px solid var(--muted); transform:rotate(45deg); margin-left:6px; }

      .divider{ height:1px; background:var(--divider); margin:1px 0 0; }

      .row .right ha-select,
      .row .right ha-switch {
        min-width: 140px;
      }

      @media(max-width:700px){
        .grid{grid-template-columns:1fr}
        .battery-card{grid-row:auto}
      }
    
      /* Compact Card Styles */
      .compact {
        display: flex;
        align-items: center;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        backdrop-filter: var(--ha-card-backdrop-filter, none);
        box-shadow: var(--ha-card-box-shadow, none);
        box-sizing: border-box;
        border-radius: var(--ha-card-border-radius, 12px);
        border-width: var(--ha-card-border-width, 1px);
        border-style: solid;
        border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        color: var(--primary-text-color);
      }

      .compact .unit {
        transform: scale(0.6);
        transform-origin: center;
      }
      
      .compact .device{
          margin-left: 3px;
          padding: 0 0 0 0;
      }

      .compact .right {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-left: 10px;
      }

      .compact .name {
        font-weight: 800;
        font-size: 16px;
        color: var(--text);
        margin-bottom: 4px;
      }

      .compact .val {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: var(--text);
        font-size: 12px;
      }

      .compact ha-icon[icon^="mdi:battery"] {
        transform: rotate(90deg);
      }
      
      .compact ha-icon {
        scale: 0.7;
        margin-right: 1px;
      }
      
      .compact .flex{
          display: flex;
          gap: 10px;
      }
      
      .compact p{
          color: gray;
          margin: 0;
      }
    `;
  }

  constructor() {
    super();
  }

  setConfig(config) {
    this.config = {
      output: true,
      battery: true,
      production: true,
      settings: true,
      solar: true,
      compact: false,
      icon: true,
      ...config
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.config) return;

    const getState = (entity) => (hass.states[entity] ? hass.states[entity].state : 0);

    if (this.config.device) {
      const device = this.config.device;
      this._solarPower = getState(`sensor.${device}_total_input_power`);
      this._p1 = getState(`sensor.${device}_input_1_power`);
      this._p2 = getState(`sensor.${device}_input_2_power`);
      this._outputPower = getState(`sensor.${device}_total_output_power`);
      this._batteryPercent = getState(`sensor.${device}_battery_percentage`);
      this._batteryKwh = getState(`sensor.${device}_battery_capacity`) / 1000;
      this._productionToday = getState(`sensor.${device}_daily_pv_charging`) / 1000;
      this._lastUpdate = this._formatLastUpdate(this._hass.states[`sensor.${this.config.device}_last_update`]?.state) || "n/a";
      
    } else if (this.config.entities) {
      const e = this.config.entities;
    
      const getNumericValue = (entity) => {
        const stateObj = this._hass.states[entity];
        if (!stateObj) return 0;
        const value = Number(stateObj.state) || 0;
        const unit = stateObj.attributes ? stateObj.attributes.unit_of_measurement : "";
        if (unit && unit.toLowerCase() === "kwh") return value;
        if (unit && unit.toLowerCase() === "wh") return value / 1000;
        return value;
      };
    
      this._solarPower = Number(getState(e.solar_power)) || 0;
      this._p1 = Number(getState(e.p1_power)) || 0;
      this._p2 = Number(getState(e.p2_power)) || 0;
      this._p3 = e.p3_power ? Number(getState(e.p3_power)) : null;
      this._p4 = e.p4_power ? Number(getState(e.p4_power)) : null;
      this._outputPower = Number(getState(e.output_power)) || 0;
      this._batteryPercent = Number(getState(e.battery_percentage)) || 0;
      this._batteryKwh = e.battery_capacity ? getNumericValue(e.battery_capacity) : 0;
      this._productionToday = e.production_today ? getNumericValue(e.production_today) : 0;
      this._lastUpdate = this._formatLastUpdate(this._hass.states[e.last_update]?.state) || "n/a";
    }
  }

  _handleMoreInfo(entityId) {
    if (!entityId) return;
    const event = new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId }
    });
    this.dispatchEvent(event);
  }

  _getEntity(type) {
    const mapping = {
      daily_pv_charging: "production_today",
      battery_percentage: "battery_percentage",
      battery_capacity: "battery_capacity",
      total_input_power: "solar_power",
      input_1_power: "p1_power",
      input_2_power: "p2_power",
      input_3_power: "p3_power",
      input_4_power: "p4_power",
      total_output_power: "output_power",
    };
    if (this.config.device) {
      return `sensor.${this.config.device}_${type}`;
    }
    const externalType = mapping[type] || type;
    return this.config.entities ? this.config.entities[externalType] : null;
  }

  _toggleSwitch(entityId, checked) {
    this._hass.callService("switch", checked ? "turn_on" : "turn_off", {
      entity_id: entityId
    });
  }

  _formatLastUpdate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }

  _renderCompact(batteryClass){
      const percent = this._batteryPercent || 0;
      let color = "green";
      if (percent <= 19) color = "red";
      else if (percent <= 59) color = "orange";

      let icon = "";
      if (percent >= 100) icon = "mdi:battery";
      else if (percent < 10) icon = "mdi:battery-outline";
      else icon = `mdi:battery-${Math.floor(percent / 10) * 10}`;

      return html`
        <div class="compact" @click=${() => this._handleMoreInfo(this._getEntity("battery_percentage"))}>
          <div class="device">
            <div class="unit">
              <div class="battery-bar">
                <div class="battery-fill ${batteryClass}" style="height:${Math.min(this._batteryPercent, 98)}%"></div>
              </div>
            </div>
          </div>
          <div class="right">
            <div class="name">${this.config.name || this.config.device}</div>
            <div class="flex">
              <div class="val"><ha-icon icon="mdi:solar-power"></ha-icon><p>${this._solarPower}W</p></div>
              <div class="val"><ha-icon icon="mdi:transmission-tower"></ha-icon><p>${this._outputPower}W</p></div>
              <div class="val"><ha-icon icon=${icon} style="color:${color}"></ha-icon><p>${this._batteryPercent}%</p></div>
            </div>
          </div>
        </div>`;
  }

  _renderUnit(batteryClass){
    return html`<div class="unit"><div class="battery-bar"><div class="battery-fill ${batteryClass}" style="height:${Math.min(this._batteryPercent, 98)}%"></div></div></div>`
  }

  _renderSolar(lang){
      const max1 = this.config.max_input_power || 600;
      const max2 = this.config.max_input_power2 || 600;
      const p1Pct = Math.min(Math.round((this._p1 / max1) * 100), 100);
      const p2Pct = Math.min(Math.round((this._p2 / max2) * 100), 100);

      return html`
        <article class="card solar">
          <div class="title">
            ${localize("card.solar", lang)}
            <div class="right-big" @click=${() => this._handleMoreInfo(this._getEntity("total_input_power"))}>${this._solarPower}</div><div class="big-num-unit">W</div>
          </div>
          <div style="width: 100%;">
            <div class="barlabels">
              <div @click=${() => this._handleMoreInfo(this._getEntity("input_1_power"))}>${this._p1} W</div>
              <div @click=${() => this._handleMoreInfo(this._getEntity("input_2_power"))}>${this._p2} W</div>
            </div>
            <div class="barwrap">
              <div class="bar"><div class="fill" style="width:${p1Pct}%"></div></div>
              <div class="bar r"><div class="fill" style="width:${p2Pct}%"></div></div>
            </div>
            <div class="barlabels"><div class="hint">P1</div><div class="hint">P2</div></div>
          </div>
          <div class="icon"><ha-icon icon="mdi:solar-power-variant-outline"></ha-icon></div>
        </article>`;
  }

  _renderOutput(lang){
      return html`
        <article class="card" @click=${() => this._handleMoreInfo(this._getEntity("total_output_power"))}>
          <div class="title">${localize("card.output", lang)}</div>
          <div class="subtitle">${localize("card.realtime", lang)}</div>
          <div class="flex-wrapper"><div class="big-num">${Number(this._outputPower).toFixed(1)}</div><div class="big-num-unit">W</div></div>
          <div class="icon"><ha-icon icon="mdi:transmission-tower"></ha-icon></div>
        </article>`;
  }

  _renderBattery(lang, solar, output){
    return html`
      <article class="card battery-card">
        <div class="title">${localize("card.battery", lang)}</div>
        <div class="battery">
          <div class="ring" style="background: conic-gradient(#FC2022 0 ${Math.min(this._batteryPercent, 15)}%, orange ${Math.min(this._batteryPercent, 50)}%, #58C3D3 ${Math.min(this._batteryPercent, 100)}%, rgb(13, 13, 13) ${this._batteryPercent}% 100%);" @click=${() => this._handleMoreInfo(this._getEntity("battery_percentage"))}>
            <div class="inner">
              ${solar > output && this._batteryPercent < 100 ? html`<ha-icon icon="mdi:lightning-bolt" class="pulse-green" style="position:absolute; top:10px; transform: translateX(-50%);"></ha-icon>` : ''}
              <div style="text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <div class="flex-wrapper"><div class="kwh">${Number(this._batteryKwh).toFixed(2)}</div><div class="big-num-unit white">kWh</div></div>
                <div class="percent">${this._batteryPercent}%</div>
              </div>
            </div>
          </div>
          <div class="icon"><ha-icon icon="mdi:battery-high"></ha-icon></div>
        </div>
      </article>`;
  }

  _renderProduction(lang){
      return html`
        <article class="card" @click=${() => this._handleMoreInfo(this._getEntity("daily_pv_charging"))}>
          <div class="title">${localize("card.production", lang)}</div>
          <div class="subtitle">${localize("card.today", lang)}</div>
          <div class="flex-wrapper"><div class="big-num">${Number(this._productionToday).toFixed(2)}</div><div class="big-num-unit">kWh</div></div>
          <div class="icon"><ha-icon icon="mdi:chart-bar"></ha-icon></div>
        </article>`;
  }

  

_renderSettings(lang) {
    const device = this.config.device;
    if (!device) return html``;

    // Haal de entiteit op
    const entityId = `select.${device}_automatic_discharge_mode`;
    const dischargeMode = this._hass.states[entityId];

    // Als de entiteit niet bestaat in HASS, toon dan niets voor dit specifieke blokje
    if (!dischargeMode) {
      return html``;
    }

    return html`
      <div class="row">
        <div class="left">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span>${localize("labels.discharge_mode", lang)}</span>
        </div>
        <div class="right">
          <ha-select
            fixedMenuPosition
            naturalMenuWidth
            .value=${dischargeMode.state}
            @selected=${(ev) => {
              if (ev.target.value !== dischargeMode.state) {
                this._hass.callService("select", "select_option", { 
                  entity_id: dischargeMode.entity_id, 
                  option: ev.target.value 
                });
              }
            }}
            @click=${(e) => e.stopPropagation()}
          >
            ${(dischargeMode.attributes.options || []).map(opt => html`
              <mwc-list-item .value=${opt}>${opt}</mwc-list-item>
            `)}
          </ha-select>
        </div>
      </div>
    `;
  }

  _renderCustomSettings() {
    if (!this.config.custom_settings) return html``;
    const settings = Array.isArray(this.config.custom_settings) ? this.config.custom_settings : [this.config.custom_settings];
    
    return settings.map(s => {
      const stateObj = this._hass.states[s.entity];
      if (!stateObj) return html``;
      return html`
        <div class="divider"></div>
        <div class="row">
          <div class="left">
            <ha-icon .icon=${s.icon || 'mdi:cog'}></ha-icon>
            <span>${s.name || stateObj.attributes.friendly_name}</span>
          </div>
          <div class="right">
            ${s.entity.startsWith("switch.") 
              ? html`<ha-switch .checked=${stateObj.state === "on"} @change=${(e) => this._toggleSwitch(s.entity, e.target.checked)} @click=${(e) => e.stopPropagation()}></ha-switch>`
              : html`<div @click=${(e) => { e.stopPropagation(); this._handleMoreInfo(s.entity); }} style="cursor:pointer; display: flex; align-items: center;">
                  ${stateObj.state} ${stateObj.attributes.unit_of_measurement || ""}
                  <div class="chev"></div>
                </div>`
            }
          </div>
        </div>
      `;
    });
  }

  render() {
    if (!this._hass || !this.config) return html``;
    const lang = this._hass.language || "en";
    const solar = Number(this._solarPower) || 0;
    const output = Number(this._outputPower) || 0;
    const batteryClass = solar > output ? "charging" : (output > solar ? "discharging" : "");

    if (this.config.compact) return this._renderCompact(batteryClass);

    const showDeviceSettings = !!(this.config.settings && this.config.device);
    const showCustomSettings = !!(this.config.custom_settings && (Array.isArray(this.config.custom_settings) ? this.config.custom_settings.length : true));

    return html`
      <div class="container">
        <div class="device">${this._renderUnit(batteryClass)}</div>
        <div class="grid">
          ${this.config.solar ? this._renderSolar(lang) : ""}
          ${this.config.battery ? this._renderBattery(lang, solar, output) : ""}
          ${this.config.output ? this._renderOutput(lang) : ""}
          ${this.config.production ? this._renderProduction(lang) : ""}
        </div>

         ${(showDeviceSettings || showCustomSettings) ? html`
          <div class="divider" style="margin-top:15px"></div>
          ${showDeviceSettings ? this._renderSettings(lang) : ""}
          ${showCustomSettings ? this._renderCustomSettings() : ""}
        ` : ""}

        <div style="text-align:center; font-size:10px; color:var(--muted); margin-top:10px;">
          ${localize("labels.last_update", lang)}: ${this._lastUpdate}
        </div>
      </div>`;
  }
}

customElements.define("b2500d-card-offline", B2500DCard);

// -------------------------------------
// Config Editor
// -------------------------------------

class B2500DCardEditor extends LitElement {
  static get properties() {
    return {
      _config: { type: Object },
      hass: { type: Object },
    };
  }


  setConfig(config) {
    this._config = {
      output: true,
      battery: true,
      production: true,
      settings: true,
      solar: true,
      icon: true,
      compact: false,
      max_input_power: 600,
      max_input_power2: 600,
      max_input_power3: 600,
      max_input_power4: 600,
      entities: {
        battery_percentage: "",
        battery_capacity: "",
        solar_power: "",
        p1_power: "",
        p2_power: "",
        output_power: "",
        production_today: ""
      },
      ...config,
    };
  }
  


  set hass(hass) {
    this._hass = hass;
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) return;

    const newConfig = { ...ev.detail.value };

    if (newConfig.entities) {
      const isEmpty = Object.values(newConfig.entities).every(
        (v) => v === null || v === undefined || v === ""
      );
      if (isEmpty) {
        delete newConfig.entities;
      }
    }

    this._config = newConfig;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true
      })
    );
  }

  _computeLabel(field) {
    const name = field?.name || field; 
    const lang = this._hass?.locale?.language || this._hass?.language || navigator?.language || "en";
    return localize(`editor.${name}`, lang);
  }

  _computeHelper(field) {
    const name = field?.name || field;
    const lang = this._hass?.locale?.language || this._hass?.language || navigator?.language || "en";
    return localize(`helpers.${name}`, lang);
  }

  render() {
    if (!this._config) return html``;

    const schema = [
      { name: "name", selector: { text: {} } },
      { name: "device", selector: { text: {} } },
      {
        name: "entities",
        selector: {
          object: {
            properties: {
              battery_percentage: { selector: { entity: {} } },
              battery_capacity: { selector: { entity: {} } },
              solar_power: { selector: { entity: {} } },
              p1_power: { selector: { entity: {} } },
              p2_power: { selector: { entity: {} } },
              output_power: { selector: { entity: {} } },
              production_today: { selector: { entity: {} } }
            }
          }
        }
      },
      {
          name: "custom_settings",
          selector: {
            object: {
              properties: {
                entity: { selector: { entity: {} } },
                name: { selector: { text: {} } },
                icon: { selector: { text: {} } }
              }
            }
          },
        },
      { name: "compact", selector: { boolean: {} } },
      { name: "icon", selector: { boolean: {} } },
      { name: "solar", selector: { boolean: {} } },
      { name: "output", selector: { boolean: {} } },
      { name: "battery", selector: { boolean: {} } },
      { name: "production", selector: { boolean: {} } },
      { name: "settings", selector: { boolean: {} } },
      { name: "max_input_power", selector: { number: { min: 100, max: 5000, step: 50 } }},
      { name: "max_input_power2", selector: { number: { min: 100, max: 5000, step: 50 } }},
      { name: "max_input_power3", selector: { number: { min: 100, max: 5000, step: 50 } }},
      { name: "max_input_power4", selector: { number: { min: 100, max: 5000, step: 50 } }},
    ];

    return html`
      <ha-form
        .hass=${this._hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${(f) => this._computeLabel(f)}
        .computeHelper=${(f) => this._computeHelper(f)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define("b2500d-card-offline-editor", B2500DCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "b2500d-card-offline",
    name: "Solar Storage Card fully local",
    preview: true,
    description: "Visualizing B2500 battery fully local",
});
