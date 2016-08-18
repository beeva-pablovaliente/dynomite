FROM ubuntu

MAINTAINER BEEVA Innovation department "hablemos@beeva.com"

RUN apt-get update && apt-get install -y \
	autoconf \
	build-essential \
	dh-autoreconf \
	git \
	libssl-dev \
	libtool \
	python-software-properties \
	tcl8.5

#RUN git clone -b beeva https://github.com/beeva-pablovaliente/dynomite.git
#RUN echo 'Git repo has been cloned in your Docker VM'

ADD . dynomite/

WORKDIR dynomite/

RUN autoreconf -fvi \
	&& ./configure --enable-debug=log \
	&& CFLAGS="-ggdb3 -O0" ./configure --enable-debug=full \
	&& make \
	&& make install

#RUN sed -i 's/127.0.0.1:8/0.0.0.0:8/g' conf/dynomite.yml
#RUN sed -i 's/127.0.0.1:22122/redis:6379/g' conf/dynomite.yml
#RUN sed -i 's/127.0.0.1:6379/redis:6379/g' conf/dynomite_florida_single.yml
#RUN sed -i '$ a\  dyn_seed_provider: florida_provider' conf/dynomite.yml
#RUN sed -i -e '$ a\ gos_interval: 10000' conf/dynomite_florida_single.yml
#RUN sed -i -e '$ a\ preconnect: true' conf/dynomite_florida_single.yml
#RUN sed -i -e '$ a\ hash: murmur' conf/dynomite_florida_single.yml

EXPOSE 8101
EXPOSE 8102
EXPOSE 22222

CMD ["src/dynomite", "-c", "conf/dynomite_florida_single.yml", "-s", "22222", "-v9"]
