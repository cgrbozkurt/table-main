import Sc from '@/components/Sc'
import { addStock, langs } from '@/lib/data'
import { StockColumn } from '@/lib/table'
import React from 'react'

const Stockcontrol = () => {
  return (
    <div>
         <Sc 
              columns={StockColumn}
         langs={langs}
         initial_dt={addStock}
         perPage={10}
         pagination={true}
         paginationType="page"
         defaultLang="Us"/>
    </div>
  )
}

export default Stockcontrol