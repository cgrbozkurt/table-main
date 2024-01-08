import CustomTable from '@/components/CustomTable'
import { data, langs } from '@/lib/data'
import { TestColumns } from '@/lib/table'
import React from 'react'

const Test = () => {
  return (
    <div>
        <CustomTable
        columns={TestColumns}
        langs={langs}
        initial_dt={data}
        perPage={10}
        pagination={true}
        paginationType="page"
        defaultLang="Us"
        />
    </div>
  )
}

export default Test