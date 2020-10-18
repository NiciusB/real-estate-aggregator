import { Op } from 'sequelize'
import ListingPictures from '../models/ListingPictures'
import proxiedFetch from './lib/proxiedFetch'
import imageHash from 'node-image-hash'
import { logMessage, SEVERITY } from './lib/monitoring-log'
import { sequelize } from './db'

async function downloadMissingListingImage() {
  const imgWithoutDownload = await ListingPictures.findOne({
    where: {
      imgHash: { [Op.eq]: null },
    },
    order: sequelize.random(),
  })

  if (!imgWithoutDownload) return

  const { response } = await proxiedFetch(imgWithoutDownload.originalUrl)
  const imgBuffer = await response.buffer()

  const imgHash = await imageHash.hash(imgBuffer, 64, 'base64').then((hash) => hash.hash)

  imgWithoutDownload.imgHash = imgHash
  imgWithoutDownload.imgBlob = imgBuffer
  await imgWithoutDownload.save()

  logMessage('🐸 Finished saving new listing image!', SEVERITY.Debug)
}

export function setupDownloadListingImageTimer() {
  if (process.env.NODE_ENV === 'dev') {
    downloadMissingListingImage()
  }

  setInterval(downloadMissingListingImage, 1000 * 5)
}
