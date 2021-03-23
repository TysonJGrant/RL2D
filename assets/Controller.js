window.addEventListener('gamepadconnected', (event) => {
  const update = () => {
    const output = document.getElementById('axes');
    output.innerHTML = ''; // clear the output

    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue;
      for (const [index, axis] of gamepad.axes.entries()) {
        output.insertAdjacentHTML('beforeend',
          `<label>${gamepad.index}, ${index}
             <progress value=${axis * 0.5 + 0.5}></progress>
           </label>`);
      }
      for (const [index, button] of gamepad.buttons.entries()) {
        output.insertAdjacentHTML('beforeend',
          `<label>${gamepad.index}, ${index}
             <progress value=${button.value}></progress>
           </label>`);
      }
    }
    requestAnimationFrame(update);
  };
  update();
});
