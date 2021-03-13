const localDate = (year, month, date) => {
    return new Date(`${year}-${month}-${date}T00:00:00Z`)
}

const prevDate = (year, month, date) => {
    const d = localDate(year, month, date)
    d.setDate(d.getDate() - 1)
    return d
}

const nextDate = (year, month, date) => {
    const d = localDate(year, month, date)
    d.setDate(d.getDate() + 1)
    return d
}

module.exports = {
    localDate,
    prevDate,
    nextDate
}