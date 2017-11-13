export default function(data) {
  const commands = data.map(command => {
    const {
      name,
      parameters,
    } = command;

    const par = Object.entries(parameters).map(parameter => {
      const [ key, value ] = parameter;

      const v = (value.type === 'string') ? `"${value.value}"` : value.value;

      return `${key} = ${v}`;
    }).join(', ');

    return `${name}(${par});`;
  });

  return commands.join('\n');
}
