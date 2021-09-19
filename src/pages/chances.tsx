/* eslint-disable no-console */
import React from 'react'
import _ from 'lodash'
import { useWindowSize } from '../hooks/useWindowSize'
import Loading from '../components/Loading/Loading'
import { Chances } from '../components/Chances/Chances'

export default function Page() {
  const { width: wScreen, height: hScreen } = useWindowSize()

  if (!wScreen || !hScreen) {
    return <Loading />
  }

  return <Chances wScreen={wScreen} hScreen={hScreen} />
}
