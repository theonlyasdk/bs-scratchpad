String.prototype.indent = function(level) {
  if (typeof level !== 'number' || level < 0 || !Number.isInteger(level)) {
    return this.toString();
  }

  const indentation = ' '.repeat(level);
  const lines = this.split('\n');
  const indentedLines = lines.map(line => indentation + line);
  return indentedLines.join('\n');
};