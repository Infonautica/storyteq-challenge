import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  cleanup()
})

const getCitiesInput = () => {
  const inputs = screen.getAllByRole('combobox')
  return inputs[0]
}

const getBooksInput = () => {
  const inputs = screen.getAllByRole('combobox')
  return inputs[1]
}

describe('App', () => {
  it('renders 2 inputs', () => {
    render(App)

    const inputs = screen.getAllByRole('combobox')
    expect(inputs).toHaveLength(2)
  })

  it('initially shows instructions', () => {
    render(App)

    const instructions = screen.getAllByText('Type at least 3 characters to search...')
    expect(instructions).toHaveLength(2)
  })

  it('Does not show results when input has only 2 chars', async () => {
    render(App)

    const citiesInput = getCitiesInput()
    await fireEvent.input(citiesInput, { target: { value: 'sa' } })

    const instructions = screen.getAllByText('Type at least 3 characters to search...')
    expect(instructions).toHaveLength(2)
  })

  it('Shows the list when at least 3 chars typed and there is a match', async () => {
    render(App)

    const citiesInput = getCitiesInput()
    await fireEvent.input(citiesInput, { target: { value: 'sand' } })

    const instructions = screen.getAllByText('Type at least 3 characters to search...')
    expect(instructions).toHaveLength(1)

    const match = screen.getByText('thousand oaks')
    expect(match).toBeTruthy()
  })

  it('Shows multiple matches', async () => {
    render(App)

    const citiesInput = getCitiesInput()
    await fireEvent.input(citiesInput, { target: { value: 'sant' } })

    const instructions = screen.getAllByText('Type at least 3 characters to search...')
    expect(instructions).toHaveLength(1)

    const match1 = screen.getByText('santiago')
    const match2 = screen.getByText('santa rosa')
    expect(match1).toBeTruthy()
    expect(match2).toBeTruthy()
  })
})
