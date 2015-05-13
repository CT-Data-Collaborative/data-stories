require(reshape2)

# hr1 <- read.csv("hitrate.csv", strip.white=TRUE)
# hr1 <- hr1[,c(1,5)]

hr1 <- read.csv("hitratedata.csv", strip.white=TRUE)
pvals <- read.csv("pvals.csv", strip.white=TRUE)
hr <- merge(hr1, pvals, by.x="department", by.y="Department")
# test <- test[!is.na(test$pvalue),]

hr_h <- hr[,c(1,4,14,15,16,23)]
hr_b <- hr[,c(1,4,11,12,13,22)]
hr_nc <- hr[,c(1,4,5,6,7,20)]
hr_bh <- hr[,c(1,4,17,18,19,24)]
hr_nch <- hr[,c(1,4,8,9,10,21)]

hr_h$hitrate_hispanic <- hr_h$hits / hr_h$searches

hr_h$Group <- "Hispanic"
hr_b$Group <- "Black"
hr_nc$Group <- "Non-caucasian"
hr_bh$Group <- "Black or Hispanic"
hr_nch$Group <- "Non-caucasian or Hispanic"

columnnames <- c("Department", "hr_c", "searches", "hits", "hr_group", "pval", "Group")
names(hr_h) <- columnnames
names(hr_b) <- columnnames
names(hr_nc) <- columnnames
names(hr_bh) <- columnnames
names(hr_nch) <- columnnames

hitrate <- rbind(hr_h,hr_b,hr_nc,hr_bh,hr_nch)

hitrate <- hitrate[,c(1,7,2,5,3,4,6)]
hitrate <- hitrate[!is.na(hitrate$pval),]
write.csv(file="final_hitrate.csv", hitrate, row.names=FALSE)
