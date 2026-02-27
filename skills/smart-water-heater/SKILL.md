/**
 * Smart Water Heater Control - 智能热水器控制
 * 物联网设备控制
 */

class SmartWaterHeater {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'http://localhost:8080';
    this.deviceId = options.deviceId;
    this.token = options.token;
  }

  /**
   * 获取设备状态
   */
  async getStatus() {
    const response = await fetch(`${this.apiUrl}/device/${this.deviceId}/status`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  /**
   * 设置温度
   */
  async setTemperature(temp) {
    const response = await fetch(`${this.apiUrl}/device/${this.deviceId}/control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command: 'set_temperature', value: temp })
    });
    return response.json();
  }

  /**
   * 开关机
   */
  async power(on) {
    const response = await fetch(`${this.apiUrl}/device/${this.deviceId}/control`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ command: 'power', value: on ? 'on' : 'off' })
    });
    return response.json();
  }

  /**
   * 定时开关
   */
  async schedule(onTime, offTime) {
    const response = await fetch(`${this.apiUrl}/device/${this.deviceId}/schedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ on_time: onTime, off_time: offTime })
    });
    return response.json();
  }
}

module.exports = { SmartWaterHeater };
