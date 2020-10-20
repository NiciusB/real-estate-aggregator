import express from 'express'
import Listing from '../../models/Listing'
import ListingPictures from '../../models/ListingPictures'
import { sequelize } from '../db'
import { logMessage, SEVERITY } from '../lib/monitoring-log'
import { Op } from 'sequelize'

const app = express()
const port = parseInt(process.env.API_PORT)
const apiUrl = `http://localhost:${port}`

app.get('/', (req, res) => {
  res.redirect('/listings')
})

app.get('/pic/:picID', async (req, res) => {
  const listingPic = await ListingPictures.findOne({ where: { id: req.params.picID } })

  res.contentType('image/jpeg') // might be png sometimes, but browsers are cool
  res.send(listingPic.imgBlob)
})

app.get('/listings', async (req, res) => {
  const listings = await Listing.findAll({ limit: 10, order: sequelize.random() })
  const listing = await Promise.all(listings.map((l) => getListingData(l.id)))

  res.json({ listing })
})

export default function setupApiServer() {
  app.listen(port, () => {
    logMessage(`✨ API listening at http://localhost:${port}`, SEVERITY.Info)
  })
}

async function getListingData(listingId?: number) {
  const listing = await Listing.findOne({ where: { id: listingId } })
  const pictures = (await ListingPictures.findAll({ where: { listingId: listingId, imgBlob: { [Op.ne]: null } } })).map(
    (pic) => ({
      id: pic.id,
      url: `${apiUrl}/pic/${pic.id}`,
    })
  )

  return {
    listing,
    pictures,
  }
}
