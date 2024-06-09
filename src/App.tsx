import { createSignal, createEffect, Show } from 'solid-js'
import './App.css'

export type collectable = {
  name: string,
  rarity: string,
  img: string,
}


function App() {
  const [item, setItem] = createSignal<collectable>()
  const [collectables, setCollectables] = createSignal<collectable[]>([])
  const [lastCollected, setLastCollected] = createSignal<collectable[]>([])

  createEffect(async ()=> {
    getCollectables()
  })

  const getCollectables = async function() {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/collectables/`)
    const data = await res.json();
    setCollectables(data)
  }

  const getRandomCollectable = async function() {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/collectables/random`)
    const data: collectable = await res.json()

    let tempArr = lastCollected();
    if(tempArr.length >= 10) {
      tempArr = tempArr.slice(1)
    }
    tempArr.push(data)
    console.log(tempArr)
    setLastCollected([...tempArr])

    setItem(data);
  }

  return (
    <>
      <h1>Stream Collectables</h1>
      <div class='grid'>
        <div class="card">
          <button onClick={() => getRandomCollectable()}>
            Try your luck!
          </button>
          <Show when={item()}>
            <div class='card'>
              <p class={`puff-name ${item()?.rarity.trimEnd().replace(" ", "-")}`}> {item()?.name} </p>
              <img src={item()?.img} alt="" />
            </div>
          </Show>
        </div>
        <aside>
          <h2>Current Collectables</h2>
          <Show when={collectables()} fallback={<div>Loading...</div>}>
            <ul style={{"list-style": "none", 
              "text-align": 'left'
              }}>
              {collectables().map(c => {
                return (
                  <li>
                    {c.name} : <span class={c?.rarity.trimEnd().replace(" ", "-")}>{c.rarity}</span>
                  </li>
                )
                })}
            </ul>
          </Show>
          <h3>Previous Pulls</h3>
          <ul class='previous-pulls'>
            {lastCollected().map(c => {
              return (<li class={c?.rarity.trimEnd().replace(" ", "-")}>{c.name}</li>)
              })}
          </ul>
        </aside>
      </div>
    </>
  )
}

export default App
