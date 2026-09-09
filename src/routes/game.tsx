import { createFileRoute } from '@tanstack/react-router'
import { ToughCrowdGame } from '../components/ToughCrowdGame'

export const Route = createFileRoute('/game')({
  component: GamePage,
})

function GamePage() {
  return <ToughCrowdGame />
}
