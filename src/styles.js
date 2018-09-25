class XdebugStyles {
  container() {
    return `
        float: right; 
        display: block; 
        height: 100%; 
        width: 65px; 
        text-align: center;
    `;
  }

  switch() {
    return `
      float: right; 
      display: inline-block; 
      height: 100%; 
      padding: 0 5px; 
      line-height: 45px;
      text-align: center;
    `;
  }
}

module.exports = new XdebugStyles();
