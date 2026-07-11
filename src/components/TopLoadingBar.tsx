// Barra fina animada exibida no topo enquanto uma tela carrega.
export function TopLoadingBar() {
  return (
    <div className="progress-track" role="progressbar" aria-label="Carregando" aria-busy="true">
      <div className="progress-bar" />
    </div>
  )
}
